import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Oxygen, Ubuntu, Cantarell, 'Open Sans', sans-serif;
    font-size: 16px;
    line-height: 1.5;
    color: ${({ theme }) => theme.colors.text};
    background-color: ${({ theme }) => theme.colors.background};
  }

  .app-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    max-height: 100vh;
    overflow: hidden;
  }

  .main-content {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  /* Spreadsheet Grid Styles */
  .spreadsheet-grid {
    width: 100%;
    height: 100%;
    overflow: auto;
  }

  .spreadsheet-table {
    border-collapse: collapse;
    width: auto;
    min-width: 100%;
  }

  .corner-header {
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    padding: 4px;
    text-align: center;
    width: 40px;
    height: 30px;
    position: sticky;
    top: 0;
    left: 0;
    z-index: 3;
  }

  .column-header {
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    padding: 4px;
    text-align: center;
    font-weight: 500;
    position: sticky;
    top: 0;
    z-index: 2;
  }

  .row-header {
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    padding: 4px;
    text-align: center;
    font-weight: 500;
    position: sticky;
    left: 0;
    z-index: 1;
  }

  .spreadsheet-cell {
    border: 1px solid #dee2e6;
    padding: 4px;
    height: 30px;
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .spreadsheet-cell.selected {
    background-color: rgba(74, 144, 226, 0.2);
  }

  .spreadsheet-cell.hovered {
    background-color: rgba(74, 144, 226, 0.1);
  }

  .spreadsheet-cell.editing {
    padding: 0;
    position: relative;
  }

  .cell-input {
    width: 100%;
    height: 100%;
    padding: 4px;
    border: none;
    outline: 2px solid #4A90E2;
    box-sizing: border-box;
  }

  /* Chart styles */
  .chart-container {
    padding: 16px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 16px;
  }

  /* Utility classes */
  .text-center {
    text-align: center;
  }

  .mb-1 {
    margin-bottom: 8px;
  }

  .mb-2 {
    margin-bottom: 16px;
  }

  .p-1 {
    padding: 8px;
  }

  .p-2 {
    padding: 16px;
  }
`;

export default GlobalStyle; 