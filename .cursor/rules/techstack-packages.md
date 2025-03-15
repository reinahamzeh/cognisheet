### Project Overview

**Cognisheet** is a user-friendly spreadsheet tool designed for non-technical users to interact with spreadsheet data using natural language queries via a chat interface. The application prioritizes simplicity, privacy (through local data handling), and accessibility for beginners. This tech stack ensures a lightweight, secure, and intuitive experience.

---

## Core Technologies

| **Technology** | **Version** | **Justification** |
| --- | --- | --- |
| **JavaScript** | ES2020+ | Widely supported, ideal for dynamic web apps like Cognisheet’s interactive UI. |
| **React** | 18.x | Simplifies UI management with components, perfect for a beginner-friendly design. |
| **Node.js** | 18.x | Enables local file handling and logic, supporting privacy-focused features. |
| **Electron** | 22.x | Turns Cognisheet into a desktop app, ensuring local data access and security. |

---

## Framework Versions

| **Framework** | **Version** | **Justification** |
| --- | --- | --- |
| **React** | 18.x | Modern features like hooks improve performance and ease of development. |
| **Electron** | 22.x | Stable, compatible with Node.js, ensuring reliable desktop functionality. |
| **Node.js** | 18.x | LTS version offers stability and support for production use. |

---

## External Dependencies

| **Dependency** | **Version** | **Purpose** | **Justification** |
| --- | --- | --- | --- |
| **PapaParse** | 5.x | Parses `.csv` files, even large ones, efficiently. | Reliable, industry-standard CSV parsing for broad file support. |
| **XLSX** | 0.18.x | Reads `.xls` files, supporting Excel compatibility. | Ensures accessibility for common spreadsheet formats. |
| **Compromise** | 14.x | Lightweight NLP for basic query interpretation. | Local, simple, and privacy-friendly for beginner-level query handling. |
| **Chart.js** | 4.x | Creates charts (bar, line, pie) in-app. | Easy integration with React, enhancing data visualization for users. |
| **React-Grid-Layout** | 1.x | Manages responsive spreadsheet grid layout. | Provides an intuitive, flexible UI for non-technical users. |

---

## Development Tools

| **Tool** | **Version** | **Purpose** | **Justification** |
| --- | --- | --- | --- |
| **Vite** | 4.x | Fast build tool with hot module replacement for React. | Boosts development speed and efficiency. |
| **ESLint** | 8.x | Ensures code quality and consistency. | Maintains a clean, collaborative codebase. |
| **Prettier** | 2.x | Formats code automatically for readability. | Keeps code consistent and easy to read. |
| **Git** | 2.x | Version control for tracking and collaboration. | Standard for team workflows and project management. |
| **npm** | 8.x | Manages dependencies and scripts. | Reliable, widely-used package manager for this stack. |

---

## Testing Frameworks

| **Framework** | **Version** | **Purpose** | **Justification** |
| --- | --- | --- | --- |
| **Jest** | 29.x | Unit tests for React components and JavaScript logic. | Robust testing for reliable functionality. |
| **React Testing Library** | 13.x | Tests React components based on user interactions. | Mimics real user behavior, aligning with usability goals. |
| **Cypress** | 12.x | End-to-end testing for the full app workflow. | Ensures the entire user experience works seamlessly. |

---

## Deployment Tools

| **Tool** | **Version** | **Purpose** | **Justification** |
| --- | --- | --- | --- |
| **Electron Builder** | 23.x | Packages Electron app for Windows, macOS, and Linux. | Simplifies cross-platform deployment for broad access. |
| **GitHub Actions** | N/A | Automates build, test, and deployment pipelines. | Streamlines CI/CD for consistent, efficient releases. |

---

## Integration Requirements

- **Local File System Access**:
    - **Requirement**: Parse local spreadsheet files without uploads.
    - **Solution**: Electron’s file system APIs.
    - **Justification**: Keeps data private and local, a key project goal.
- **Natural Language Processing (NLP)**:
    - **Requirement**: Interpret basic queries (e.g., "sum," "average").
    - **Solution**: Compromise library for local NLP.
    - **Justification**: Lightweight and privacy-focused for simple query handling.
- **Data Visualization**:
    - **Requirement**: Display charts in-app.
    - **Solution**: Chart.js with React integration.
    - **Justification**: User-friendly visualizations for non-technical users.
- **User Interface**:
    - **Requirement**: Responsive, intuitive grid and chat UI.
    - **Solution**: React with React-Grid-Layout.
    - **Justification**: Ensures a beginner-friendly, easy-to-use design.

---

## Compatibility Considerations

- **Operating Systems**:
    - **Requirement**: Support Windows, macOS, and Linux.
    - **Solution**: Electron Builder for cross-platform builds.
    - **Justification**: Ensures accessibility for all users.
- **File Formats**:
    - **Requirement**: Handle `.csv` and `.xls`.
    - **Solution**: PapaParse and XLSX libraries.
    - **Justification**: Supports common formats for user convenience.
- **Performance**:
    - **Requirement**: Manage up to 10,000 rows without lag.
    - **Solution**: Optimized React, Vite, and Compromise.
    - **Justification**: Maintains smooth performance on typical hardware.