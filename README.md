# WFM Demand Forecasting AI Agent

NOTE: This project is focused on developing the Minimum Viable Product (MVP) for an AI agent that assists in analysing demand forecast data in a WFM context.

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

## Timeline
- **Week 1 (7–13 July 2025)**:
  - Build web portal and data upload with validation.
  - Start developing demand forecasting model.
- **Week 2 (14–20 July 2025)**:
  - Develop forecast dashboard and conversational AI for core questions.
  - Connect demand forecasting model to AI agent.
- **Week 3 (21–23 July 2025)**:
  - Add roster upload, scenario question, WFM suggestions, testing, demo prep.
- **Deadline**: 23 July 2025.

## Risks and Mitigations
- **Risk**: Chat struggles with vague queries.
  - **Mitigation**: Limit to ~5–6 questions with clear prompts.
- **Risk**: Stretch goals delay core features.
  - **Mitigation**: Prioritise core; demo WFM suggestions without updates if needed.
- **Risk**: Invalid data crashes app.
  - **Mitigation**: Validate uploads early.
