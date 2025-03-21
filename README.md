npm # Cognisheet

Cognisheet is a user-friendly spreadsheet tool with a chat interface for natural language queries. It allows users to upload spreadsheet files (CSV, Excel) and interact with their data using simple, natural language commands.

## Features

- **File Upload**: Import CSV and Excel files with ease
- **Natural Language Queries**: Ask questions about your data in plain English
- **AI-Powered Analysis**: Use OpenAI to analyze your data and get insights
- **Data Selection**: Select ranges of data for analysis
- **Calculations**: Perform calculations like sum, average, max, min, and count
- **Visualizations**: Generate bar, line, and pie charts from your data
- **Local Processing**: Option to process data locally for privacy

## Getting Started

### Prerequisites

- Node.js (v18.x or later)
- npm (v8.x or later)
- OpenAI API key (for AI features)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/cognisheet.git
   cd cognisheet
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up your OpenAI API key:
   - Create a `.env` file in the root directory
   - Add your OpenAI API key: `VITE_OPENAI_API_KEY=your_openai_api_key_here`
   - You can get an API key from [OpenAI's platform](https://platform.openai.com/api-keys)

### Running the Application

#### Web Version (Recommended for Development)

Run the application in web mode:

```
npm run web-dev
```

Or use the provided script:

```
./start-web.sh
```

This will start:
- A Vite development server at http://localhost:5174
- An Express backend server at http://localhost:4000

Open http://localhost:5174 in your browser to use the application.

#### Desktop Version (Electron)

Run the application as a desktop app:

```
npm run electron-dev
```

Or use the provided script:

```
./start.sh
```

### Building for Production

To create a production build:

```
npm run build
npm run package
```

This will create executable files for your platform in the `dist` directory.

## Usage

1. **Upload a File**: Click the "Upload File" button to select a CSV or Excel file
2. **Select Data**: Click and drag to select cells, or use Cmd+K to select all data
3. **Ask Questions**: Type natural language queries in the chat panel, such as:
   - "What's the average of this range?"
   - "Create a bar chart of these values"
   - "What's the maximum value in column A?"
   - With AI enabled: "Analyze this data and tell me trends"
   - With AI enabled: "Summarize what this spreadsheet contains"

4. **Toggle AI Mode**: Use the AI toggle in the chat panel to switch between:
   - AI mode (uses OpenAI for advanced analysis)
   - Local mode (processes queries locally for privacy)

## Technology Stack

- **Frontend**: React, styled-components
- **Backend**: Node.js, Express
- **Desktop App**: Electron
- **Data Processing**: PapaParse (CSV), XLSX (Excel)
- **Natural Language Processing**: Compromise, OpenAI
- **Visualization**: Chart.js

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by tools like Notion, Cursor, and sheetlang.ai
- Built for non-technical users who want to interact with spreadsheet data easily
# cognisheet
