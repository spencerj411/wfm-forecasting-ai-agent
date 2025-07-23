# WFM Demand Forecasting AI Agent

An AI-powered demand forecasting application that helps store managers analyze sales data and generate accurate 7-day forecasts using Meta's Prophet algorithm. Built with Next.js and deployed on Vercel.

## Features

- 📊 **Smart Forecasting**: Generate precise 7-day demand forecasts with confidence intervals
- 📈 **Data Upload**: Easy CSV upload with validation and error handling
- 🤖 **AI Chat Assistant**: Ask natural language questions about your forecasts
- 📱 **Responsive Dashboard**: Clean, modern interface with real-time insights
- 🔐 **User Authentication**: Secure login with personal data storage
- ⚡ **Fast Performance**: Optimized Prophet model with industry-standard metrics

## Tech Stack

- **Frontend**: Next.js 15.2.4, React, TypeScript (`/frontend`)
- **Backend**: Python Flask API (`/api`) deployed on Railway
- **AI/ML**: Meta Prophet for time series forecasting
- **Database**: Supabase for user data and forecasts
- **Deployment**: Vercel (Frontend) + Railway (API)
- **Styling**: Tailwind CSS

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Python 3.9+ with virtual environment support
- Git

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wfm-forecasting-ai-agent
   ```

2. **Run setup script**
   ```bash
   ./scripts/setup.sh
   ```
   This will:
   - Create Python virtual environment
   - Install all dependencies (Python + Node.js)
   - Create environment file template

3. **Configure environment**
   - Edit `frontend/.env.local` with your Supabase credentials
   - API URL is already set to `http://localhost:8000`

4. **Start development servers**

   **Terminal 1 - API Server:**
   ```bash
   ./scripts/start-api.sh
   ```

   **Terminal 2 - Frontend Server:**
   ```bash
   ./scripts/start-frontend.sh
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Prophet API: http://localhost:8000/forecast
   - Health Check: http://localhost:8000/health

### How It Works

1. **Upload Data**: Upload a CSV file with `date` and `sales` columns
2. **Generate Forecast**: The Prophet model analyzes patterns and generates 7-day predictions
3. **View Dashboard**: See forecasts with confidence intervals and model accuracy metrics
4. **Ask Questions**: Use the AI chat to get insights about your forecasts

### Sample Data Format

```csv
date,sales
2022-01-01,1000
2022-01-02,1100
2022-01-03,950
...
```

## Deployment

### Deploy Frontend to Vercel

1. **Connect to Vercel**
   ```bash
   npx vercel
   ```

2. **Environment Variables**
   - Set up your environment variables in the Vercel dashboard
   - Include Supabase credentials and Railway API URL:
   ```bash
   NEXT_PUBLIC_API_URL=https://your-app-name.railway.app
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Deploy API to Railway

1. **Connect GitHub to Railway**
   - Go to [Railway](https://railway.app)
   - Connect your GitHub repository
   - Railway will auto-detect the Python app

2. **Files Railway needs:**
   - `main.py` - Flask application
   - `requirements.txt` - Python dependencies
   - `nixpacks.toml` - Start command configuration
   - `.python-version` - Python version specification

3. **Railway will automatically:**
   - Install dependencies from `requirements.txt`
   - Start the app with `gunicorn main:app`
   - Provide a public URL for your API

## Development Notes

- **Local Development**: Run Flask API locally on port 8000, Next.js on port 3000
- **Production**: Next.js on Vercel, Python API on Railway
- **Environment Variables**: Use `NEXT_PUBLIC_API_URL` to switch between environments


## MVP Overview

### Objective
The Minimum Viable Product (MVP) enables store managers to analyse actual and forecast data through a conversational AI. Managers upload data, view a 7-day forecast, and ask questions to gain insights, supporting better operational decisions like rostering.

### Core Features
- Access a simple web portal for store-specific analysis
- Upload data to generate personalised predictions with validation
- View a dashboard with 7-day forecasts (current date aware)
- Chat with an AI to explore data insights (limiting to ~5 questions)

### Stretch Goals
- Support a scenario analysis with basic staffing insights.
- Suggest staffing changes with human approval, using a roster file; to act as a stub-like component for a WFM system.

## Key Features (Epics)
1. **Web Portal Access**
   - A simple portal for store-specific access (single-store demo).
   - **User Benefit**: Easy entry to analysis tools.

2. **Data Upload**
   - Upload a data file (CSV with date, sales).
   - Shows error messages for invalid files (e.g., “Missing sales data”).
   - **User Benefit**: Enables personalised forecasts.

3. **Forecast Dashboard**
   - Displays a table with:
     - 7-day forecast (e.g., “23 July 2025: $1,200 ± $50”).
   - **User Benefit**: Clear view of demand changes.

4. **Conversational AI Chat**
   - Ask questions naturally, with responses like:
     1. “What’s the forecast for 23 July?” → “$1,200 ± $50.”
     2. “Summarise the trend for the next 7 days” → “Sales increase on weekends; steady mid-week.”
     3. “Why is the forecast low on 23 July?” → “Based on historical patterns, lower demand expected.”
     4. “How does demand change next week?” → “Demand rises mid-week due to trends.”
     5. “What’s the forecast impact on 23 July?” → “Expected sales: $1,200.”
     6. “There’s an event in two weeks. How will it affect demand?” → “Event on 30 July boosts sales by $300; consider adding 1 staff.” (Stretch)
   - Shows conversation history.
   - **User Benefit**: Intuitive insights into data.
   - **Note**: Plan is to limit it to around 5-6 questions. Ideally, not hardcoded.

5. **Basic WFM Suggestions**
   - Suggests staffing changes for scenarios (e.g., “Add 1 staff on 30 July”).
   - Includes an “Approve” button to update a roster file.
   - Optionally displays the updated roster.
   - **User Benefit**: Early step toward WFM optimisation.
   - **Note**: This is stretch goal. Not fundamental but would be great to implment given the amount of upfront value it would bring.

## MVP Scope
- **Included** (7–20 July 2025):
  - **Web Portal Access**: Single-store portal for easy access.
  - **Data Upload**: Upload and validate CSV for forecasting.
  - **Forecast Dashboard**: Table showing 7-day forecasts.
  - **Conversational AI Chat**: ~5 core questions (1–5) for data insights.
- **Stretch Goals** (21–23 July 2025):
  - **Roster Data Upload**: Upload a roster CSV (date, staff count).
  - **Conversational AI Chat**: Add question 6 (scenario impact).
  - **Basic WFM Suggestions**: Suggest staffing changes with approval.

## Scope Exclusions
- Actionable recommendations for staffing, inventory, or promotions (except basic scenario staffing suggestion).
- Automated WFM updates (e.g., real WFM system integration).
- Headcount generation, shift creation, or shift assignment.
- Multi-store support
- Advanced visualisations (e.g., charts).

## Success Criteria
- **MVP Success**: Managers can upload data, view a 7-day forecast, and ask ~5 core questions for reliable insights.
- **Stretch Success**: Support scenario impact insights and basic staffing suggestions.
- **Demo Impact**: Showcase a user-friendly app highlighting agentic AI for data insights.

## Timeline (Slice-Based Approach)
The development follows a slice-based strategy, building end-to-end features incrementally for early testing and iteration. Each slice includes explicit steps for key components: demand forecasting model (built and connected for predictions), AI agent (developed for conversational insights), data storage (filesystem for lean actuals), validation/error handling, and integration (e.g., upload triggers model, model feeds dashboard/chat). Testing and demo prep are built into each week for quick feedback loops.

- **Week 1 (7–13 July 2025)** - **Slice 1: Core Data Flow**
  - Build web portal access with single-store demo.
  - Implement data upload with validation (sales CSV checking for required columns, error handling for invalid formats).
  - Develop the demand forecasting model (generic setup to process uploaded data and generate 7-day predictions).
  - Connect the model to data storage (use filesystem for storing actuals, ensure model reads/writes forecasts).
  - Create forecast dashboard (display 7-day forecasts from model output).
  - Integrate the slice: Ensure upload triggers model run and dashboard update.
  - Testing: Unit tests for validation/model predictions; end-to-end test (upload → model → dashboard); error handling for no data.

- **Week 2 (14–20 July 2025)** - **Slice 2: Conversational Insights**
  - Build the AI agent (setup for handling ~5 core questions, including prompt configuration for data analysis).
  - Connect AI agent to forecasts (agent queries model output/storage for grounded responses).
  - Enhance dashboard if needed (e.g., link to agent for context).
  - Integrate the slice: Ensure dashboard data feeds AI agent queries (e.g., "Why low on 23 July?" analyses forecasts).
  - Testing: Agent response tests (20–30 sample questions); integration tests (upload → model → dashboard → agent); edge cases (vague questions).
  - Demo prep: Basic prototype ready for bootcamp feedback (e.g., end-to-end demo of upload → view → ask).

- **Week 3 (21–23 July 2025)** - **Slice 3: Stretch Enhancements**
  - Add roster data upload with validation (stretch: check roster CSV, store in filesystem).
  - Extend AI agent for question 6 (scenario impact: rule-based adjustment, connected to forecasts).
  - Implement basic WFM suggestions (stretch: agent generates staffing based on forecasts, "Approve" button updates roster file).
  - Connect stretch to core (e.g., scenario question uses model data, WFM pulls from storage).
  - Full integration: Ensure all components work together (e.g., upload roster → agent scenario → approve update).
  - Testing: End-to-end tests across slices; bug fixes; performance checks (response time <2s).
  - Demo prep: Polish user flow; prepare presentation (e.g., user story: "Analyse forecast for rostering").

- **Deadline**: 23 July 2025.

## Risks and Mitigations
- **Risk**: Chat struggles with vague queries.
  - **Mitigation**: Limit to ~5–6 questions with clear prompts.
- **Risk**: Stretch goals delay core features.
  - **Mitigation**: Prioritise core; demo WFM suggestions without updates if needed.
- **Risk**: Invalid data crashes app.
  - **Mitigation**: Validate uploads early.
