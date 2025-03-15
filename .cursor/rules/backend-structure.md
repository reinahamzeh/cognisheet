## Introduction

Cognisheet is a spreadsheet tool with a chat interface for natural language queries, aimed at non-technical users. The backend architecture is crafted to enable real-time updates, integrate AI capabilities, and ensure simplicity, privacy, and performance. This document provides a detailed guide to the system’s structure and operations.

---

## Architecture Overview

### System Architecture Diagram

The architecture connects a desktop client with a local backend, AI service, and file system, ensuring all processing remains local for privacy.

```mermaid
graph TD
    A[Client (Electron + React)] -->|HTTP Requests| B[Backend (Node.js + Express)]
    B -->|NLP Queries| C[AI Service (Compromise)]
    B -->|File Operations| D[Local File System]
    C -->|Interpreted Queries| B
    D -->|Parsed Data| B
    B -->|Real-time Updates| A

```

### Key Components

- **Client**: Electron-based desktop app with a React frontend for user interaction.
- **Backend**: Node.js with Express, handling logic, data processing, and real-time updates.
- **AI Service**: Local NLP engine (Compromise) for interpreting natural language queries.
- **Local File System**: Manages storage and retrieval of spreadsheet files.

---

## Service Layer Structure

### Service Breakdown

The backend is divided into distinct services for modularity and clarity:

- **File Service**: Manages file uploads, parsing (e.g., CSV, Excel), and local storage.
- **Data Service**: Performs spreadsheet data operations like calculations or filtering.
- **AI Service**: Interprets user queries and maps them to actionable commands.
- **Real-time Service**: Uses WebSockets to deliver live updates to the client.

### Service Interactions

- **File Service → Data Service**: Parsed file data is sent for processing.
- **AI Service → Data Service**: Query interpretations trigger data manipulations.
- **Real-time Service → Client**: Updates (e.g., query results) are pushed to the UI.

---

## Data Flow Diagrams

### Data Flow for File Upload

1. User uploads a spreadsheet file through the client.
2. Client sends the file to the backend via an HTTP request.
3. File Service parses the file and saves it locally.
4. Data Service processes the parsed data into a usable format.
5. Real-time Service notifies the client of the successful upload via WebSocket.

### Data Flow for AI Query

1. User enters a natural language query in the chat interface.
2. Client sends the query to the backend’s AI Service.
3. AI Service processes the query and generates a data action (e.g., “sum column A”).
4. Data Service executes the action on the spreadsheet data.
5. Real-time Service pushes the result back to the client for display.

---

## Security Implementation

### Measures

- **Local Processing**: All data operations occur on the user’s device, avoiding cloud exposure.
- **Input Validation**: User inputs are sanitized to prevent injection or malicious commands.
- **File Access Controls**: File operations are restricted to directories explicitly chosen by the user.
- **Encryption**: Local server communication uses HTTPS with self-signed certificates.

### Justification

- Local-only data handling ensures privacy by design.
- Validation and access controls mitigate risks from malformed or unauthorized inputs.

---

## Error Handling Strategy

### Approach

- **User-Friendly Messaging**: Errors are communicated in simple, actionable terms.
- **Server-Side Logging**: Detailed logs are kept locally for debugging, hidden from users.
- **Graceful Degradation**: If AI or real-time features fail, basic functionality remains available.

### Examples

- **File Upload Failure**: "Sorry, we couldn’t open this file. Please check the format and try again."
- **AI Misunderstanding**: "I’m not sure what you meant. Could you rephrase your request?"

---

## Performance Considerations

### Strategies

- **Efficient Parsing**: Stream large files to prevent memory bottlenecks.
- **Caching**: Store parsed data and common query results for quick retrieval.
- **WebSocket Optimization**: Limit real-time updates to significant changes only.
- **Lazy Loading**: Load only the visible portion of the spreadsheet initially, fetching more as needed.

### Tools

- **PM2**: Ensures Node.js process stability and uptime.
- **Lighthouse**: Monitors and optimizes client-side performance metrics.

---

## Conclusion

This backend structure for Cognisheet delivers a responsive, secure, and AI-enhanced experience while keeping complexity low and privacy high. Real-time updates and local AI integration are seamlessly supported, making Cognisheet intuitive and efficient for users.