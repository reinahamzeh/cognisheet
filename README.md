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
- **Subscription Plans**: Free, Basic, and Premium tiers with different capabilities
- **User Authentication**: Secure login and personalized experience

## Getting Started

### Prerequisites

- Node.js (v18.x or later)
- npm (v8.x or later)
- OpenAI API key (for AI features)
- Supabase account (for database functionality)
- Clerk account (for authentication)

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

3. Set up your environment variables:
   - Create a `.env.local` file in the root directory with the following:
   ```
   # OpenAI
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   
   # Clerk
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
   ```

### Database Setup

1. Set up a Supabase project at [supabase.com](https://supabase.com)

2. Initialize the database schema:
   ```
   npm run db:init
   ```
   This will create the necessary tables, policies, and storage buckets.

3. (Optional) Seed the database with test data:
   ```
   npm run db:seed
   ```
   This will create test users with different subscription plans and sample spreadsheets.

4. Alternatively, you can run both commands at once:
   ```
   npm run db:setup
   ```

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
- A Next.js development server at http://localhost:3000

Open http://localhost:3000 in your browser to use the application.

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

1. **Sign In or Create an Account**: Use the authentication system to sign in or create a new account
2. **Upload a File**: Click the "Upload File" button to select a CSV or Excel file
3. **Select Data**: Click and drag to select cells, or use Cmd+K to select all data
4. **Ask Questions**: Type natural language queries in the chat panel, such as:
   - "What's the average of this range?"
   - "Create a bar chart of these values"
   - "What's the maximum value in column A?"
   - With AI enabled: "Analyze this data and tell me trends"
   - With AI enabled: "Summarize what this spreadsheet contains"

5. **Toggle AI Mode**: Use the AI toggle in the chat panel to switch between:
   - AI mode (uses OpenAI for advanced analysis)
   - Local mode (processes queries locally for privacy)
   
6. **Subscription Plans**:
   - Free: Basic spreadsheet functionality with limited files
   - Basic: More files and enhanced features
   - Premium: Unlimited files and all advanced features

## Technology Stack

- **Frontend**: React, Next.js, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk
- **Payments**: Stripe
- **Desktop App**: Electron
- **Data Processing**: PapaParse (CSV), XLSX (Excel)
- **Natural Language Processing**: Compromise, OpenAI
- **Visualization**: Chart.js

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by tools like Notion, Cursor, and sheetlang.ai
- Built for non-technical users who want to interact with spreadsheet data easily
