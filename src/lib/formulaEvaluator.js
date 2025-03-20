import * as mathjs from 'mathjs';

/**
 * Evaluates a spreadsheet formula
 * @param {string} formula - The formula to evaluate
 * @param {Object} cellData - Object containing all spreadsheet cell data in format {A1: value, B2: value}
 * @returns {number|string} - The result of the formula evaluation
 */
export const evaluateFormula = (formula, cellData) => {
  if (!formula || typeof formula !== 'string') return '';
  
  // If the formula doesn't start with =, it's not a formula
  if (!formula.startsWith('=')) return formula;
  
  try {
    // Remove the equals sign
    let expression = formula.substring(1).trim();
    
    // Handle common spreadsheet functions
    expression = convertSpreadsheetFunctions(expression);
    
    // Replace cell references (e.g., A1, B2) with their values
    expression = replaceCellReferences(expression, cellData);
    
    // Evaluate the expression using mathjs
    const result = mathjs.evaluate(expression);
    
    // Format the result
    if (typeof result === 'number') {
      // Round to 6 decimal places to avoid floating point issues
      return Math.round(result * 1000000) / 1000000;
    }
    
    return result;
  } catch (error) {
    console.error('Formula evaluation error:', error);
    return '#ERROR';
  }
};

/**
 * Convert spreadsheet functions to mathjs compatible functions
 * @param {string} expression - The formula expression
 * @returns {string} - The converted expression
 */
const convertSpreadsheetFunctions = (expression) => {
  // Replace SUM with math.sum
  expression = expression.replace(/SUM\(/gi, 'sum(');
  
  // Replace AVERAGE with math.mean
  expression = expression.replace(/AVERAGE\(/gi, 'mean(');
  
  // Replace COUNT with math.count
  expression = expression.replace(/COUNT\(/gi, 'count(');
  
  // Replace MIN with math.min
  expression = expression.replace(/MIN\(/gi, 'min(');
  
  // Replace MAX with math.max
  expression = expression.replace(/MAX\(/gi, 'max(');
  
  // Replace PRODUCT with math.prod
  expression = expression.replace(/PRODUCT\(/gi, 'prod(');
  
  // Add more function conversions as needed
  
  return expression;
};

/**
 * Replaces cell references in a formula with their values
 * @param {string} expression - The formula expression
 * @param {Object} cellData - Object containing all cell data
 * @returns {string} - The expression with cell references replaced
 */
const replaceCellReferences = (expression, cellData) => {
  // Regular expression to match cell references (e.g., A1, B2, etc.)
  const cellRefRegex = /([A-Z]+)([0-9]+)/g;
  
  // Replace all cell references with their values
  return expression.replace(cellRefRegex, (match) => {
    // Get the value from cellData
    const value = cellData[match];
    
    // If the cell doesn't exist or is empty, return 0
    if (value === undefined || value === '') {
      return '0';
    }
    
    // If the value is numeric, return it directly
    if (!isNaN(value)) {
      return value;
    }
    
    // If the value is a string, wrap it in quotes
    return `"${value}"`;
  });
};

/**
 * Extracts the range of cells from a formula (e.g., A1:B3)
 * @param {string} range - The range string (e.g., A1:B3)
 * @param {Object} cellData - Object containing all cell data
 * @returns {Array} - An array of values in the range
 */
export const extractCellRange = (range, cellData) => {
  // Split the range into start and end cells
  const [startCell, endCell] = range.split(':');
  
  // Extract column letters and row numbers
  const startMatch = startCell.match(/([A-Z]+)([0-9]+)/);
  const endMatch = endCell.match(/([A-Z]+)([0-9]+)/);
  
  if (!startMatch || !endMatch) {
    throw new Error(`Invalid range: ${range}`);
  }
  
  const startCol = startMatch[1];
  const startRow = parseInt(startMatch[2]);
  const endCol = endMatch[1];
  const endRow = parseInt(endMatch[2]);
  
  // Convert column letters to numbers
  const startColNum = columnLetterToNumber(startCol);
  const endColNum = columnLetterToNumber(endCol);
  
  // Extract all values in the range
  const values = [];
  
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startColNum; col <= endColNum; col++) {
      const colLetter = columnNumberToLetter(col);
      const cellRef = `${colLetter}${row}`;
      const value = cellData[cellRef];
      
      // Skip empty cells
      if (value !== undefined && value !== '') {
        values.push(parseFloat(value) || 0);
      }
    }
  }
  
  return values;
};

/**
 * Converts a column letter to its corresponding number (A=1, B=2, etc.)
 * @param {string} letter - The column letter
 * @returns {number} - The column number
 */
export const columnLetterToNumber = (letter) => {
  let result = 0;
  for (let i = 0; i < letter.length; i++) {
    result = result * 26 + (letter.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
  }
  return result;
};

/**
 * Converts a column number to its corresponding letter (1=A, 2=B, etc.)
 * @param {number} number - The column number
 * @returns {string} - The column letter
 */
export const columnNumberToLetter = (number) => {
  let letter = '';
  while (number > 0) {
    const remainder = (number - 1) % 26;
    letter = String.fromCharCode(65 + remainder) + letter;
    number = Math.floor((number - 1) / 26);
  }
  return letter;
}; 