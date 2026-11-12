# ScholarFind – React Frontend

Modern, responsive web interface built with React, TypeScript, and Tailwind CSS for discovering verified Indian government and foundation scholarships.

## Features
- **5-Step Student Onboarding Form**: Personal, Educational, Reservation Category, Financial Income, and Accommodation details.
- **Instant Deterministic Rule Matching**: Connects to the FastAPI backend (`POST /api/match` and `POST /api/students/{id}/match`) to evaluate eligibility against official guidelines.
- **Categorized Dashboard**: Displays *Eligible*, *Needs Verification*, and *Ineligible* schemes with exact explanations and required document checklists.
- **Application Tracker & Bookmarks**: Track applications as *Interested* or *Applied* with official reference numbers and milestone notes.
- **Official Portal Redirection**: Direct verified links to the National Scholarship Portal (NSP), Karnataka SSP, AICTE Pragati, etc.

## Setup & Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Run the Vite development server
npm run dev
```

The frontend connects to the backend at `/api` (proxied to `http://localhost:8000` via Vite or Express).
