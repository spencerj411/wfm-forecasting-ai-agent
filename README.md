# WFM Demand Forecasting AI Agent

NOTE: This project is focused on developing the Minimum Viable Product (MVP) for an AI agent that assists in analysing demand forecast data in a WFM context.

## Project Setup

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

### Getting Started

First, run the development server:

\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Learn More

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

### Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## MVP Overview

### Objective
The Minimum Viable Product (MVP) enables store managers to analyse actual and forecast data through a conversational AI. Managers upload data, view a 7-day forecast, and ask questions to gain insights, supporting better operational decisions like rostering.

### Core Features
- Access a simple web portal for store-specific analysis.
- Upload data to generate personalised predictions.
- View a dashboard with 7-day forecasts.
- Chat with an AI to explore data insights (limiting to ~5 questions).

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
