import OpenAI from 'openai';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY, // Get API key from environment variable
  dangerouslyAllowBrowser: true // Allow client-side usage (not recommended for production)
});

/**
 * Send a message to OpenAI's API
 * @param {string} message - The user's message
 * @param {Array} previousMessages - Previous messages for context
 * @param {Object} spreadsheetData - Data from the spreadsheet
 * @returns {Promise<string>} - The AI's response
 */
export const sendMessageToOpenAI = async (message, previousMessages = [], spreadsheetData = null) => {
  try {
    // Convert previous messages to the format expected by OpenAI
    const formattedPreviousMessages = previousMessages.map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    // Format spreadsheet data for better context
    let spreadsheetContext = '';
    if (spreadsheetData && spreadsheetData.headers && spreadsheetData.headers.length > 0) {
      // Determine how many rows to include based on data size
      const totalRows = spreadsheetData.data ? spreadsheetData.data.length : 0;
      const rowsToInclude = Math.min(totalRows, 20); // Include up to 20 rows for context
      
      // Create a more structured representation of the data
      let dataTable = '';
      
      // Add headers
      dataTable += spreadsheetData.headers.join(' | ') + '\n';
      dataTable += spreadsheetData.headers.map(() => '---').join(' | ') + '\n';
      
      // Add rows
      for (let i = 0; i < rowsToInclude; i++) {
        if (spreadsheetData.data && spreadsheetData.data[i]) {
          dataTable += spreadsheetData.data[i].map(cell => String(cell || '')).join(' | ') + '\n';
        }
      }
      
      // If there are more rows, indicate that
      if (totalRows > rowsToInclude) {
        dataTable += `... and ${totalRows - rowsToInclude} more rows\n`;
      }
      
      spreadsheetContext = `
        You are analyzing a spreadsheet with the following data:
        
        Headers: ${spreadsheetData.headers.join(', ')}
        Total rows: ${totalRows}
        
        Here's the data in table format:
        
        ${dataTable}
        
        IMPORTANT: Base your answers directly on this data. If the user asks questions about the data, 
        such as distances, values, calculations, or relationships between items in the spreadsheet,
        analyze the actual data provided above to give accurate answers.
        
        When providing calculations or analysis, show your work and reference specific cells or columns.
        When appropriate, wrap code in markdown code blocks using triple backticks.
      `;
    } else {
      spreadsheetContext = `
        No spreadsheet data is currently available. 
        Please ask the user to upload a spreadsheet file or select data from their spreadsheet.
      `;
    }

    // Prepare the messages array with detailed system instructions
    const messages = [
      {
        role: 'system',
        content: `You are an AI assistant specialized in analyzing spreadsheet data in Cognisheet.
                 Your primary goal is to help users understand their data and extract insights.
                 
                 ${spreadsheetContext}
                 
                 Guidelines for your responses:
                 1. Always analyze the actual spreadsheet data provided to answer questions.
                 2. Be specific and reference actual values from the data in your answers.
                 3. When the user asks for calculations or analysis, provide both the answer and the method.
                 4. If the user asks about specific information (like distances, names, values), look for it in the data.
                 5. If you're unsure about something or the data doesn't contain the information, be honest about it.
                 6. Keep responses concise but informative.`
      },
      ...formattedPreviousMessages,
      { role: 'user', content: message }
    ];

    // Call the OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 1000, // Increased token limit for more detailed responses
      temperature: 0.7,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw new Error(`Failed to get response from AI: ${error.message}`);
  }
};

export default openai; 