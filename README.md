# Team BuzzWare
<p align="center">
  <img src="docs/BuzzWareLogo.png" alt="BuzzWare Logo" width="300">
</p>

# csc-190-191-systemy
CSUS Senior Project by: Thomas Kone, Xavier Umeda, Tuan Ton, Rachel Shindelus, Shing Trinh, Isaac Sclafani, Serjeoh Nakata, Tyrice Woods 

# Branching/Merging Strategy
The `main` branch is the parent branch, the most current version of the application resides here.

Branches should be created by a developer when they are assigned a specific ticket in Jira.

Branch name should be named `sys-#/description-of-card` and spun off of branch `main`.

When acceptance criteria of the card has been met and is ready for review, developer must open a Pull Request, targeting `main`.
The pull request must then be reviewed and approved by another developer if everything checks out. PR reviewer can also leave feedback or criticism as they wish.

This process ensures that developers can get more comfortable with all parts of the codebase as well and as operating as a basic QA proccess.

# Instructions to Run Project Locally
This repository contains both the frontend and backend source code for the project.

## Prerequisites
Ensure you have the following installed before running the project:
- **Node.js** v20.0.0 or newer
- **npm** v10.0.0 or newer

Download from https://nodejs.org if needed. Verify with:
```bash
node -v   # should show v20.x.x or newer
npm -v    # should show 10.x.x or newer
```

> **Note:** `npm install` will fail if your versions are too old — this is enforced via the `engines` field in `package.json`.

## FRONTEND
Navigate to the frontend directory:
- cd frontend

Install dependencies (only needed once, or when packages change):
- npm install

Start the frontend dev server at http://localhost:3001/
- npm run dev

View in browser:
- http://localhost:3001/

## BACKEND
Navigate to the backend directory:
- cd backend

Install dependencies (only needed once, or when packages change):
- npm install

Start the backend at http://localhost:3000/
- npm run start OR npm run start:dev

# Synopsis of Our Project
Headword CRM is a full-stack client management platform with its purpose being to provide workers ease and efficiency in working with 
their clients. Providing a beautiful and functional dashboard page, including necessary and greatly beneficial analytics to efficiently 
track clients, interactions, deliverables, tagging, tasks, and internal workflow. 

# Testing Documents
<p>
  <a href="docs/Sys-112-114-115-116 Testing.pdf">📄 Sys 112/114/115/116 Testing</a>
</p>

<p>
  <a href="docs/Testing For Sprint03- Search Bar and Filtered Search Results.pdf">
    📄 Sprint 03 – Search Bar & Filter Tests
  </a>
</p>

<p>
  <a href="docs/Testing for Sprint2_Authentication and Verification_CSC190.pdf">
    📄 Sprint 2 – Auth & Verification Tests
  </a>
</p>

# Jira Timeline + Milestones
## Sprint 5 (Feb 8th -> Feb 21st, 2025)
### Creating the Client Profiles. 
This sprint focuses on building the foundation of the client management system. Our team will implement the UI and backend structures needed to create, store, and display detailed client profiles. This includes key data fields, layout decisions, and the initial version of the client detail view.

## Sprint 6 (Feb 22nd -> Mar 7th, 2026)
### Integrating the Google Workspace.
Our team will add Google Workspace integration to streamline importing client contacts, syncing calendars, and centralizing communication. This sprint ensures that agency users can efficiently connect their Google accounts and securely access authorized data. The integration will set the groundwork for automated email and meeting tracking.

## Sprint 7 (Mar 8th -> Mar 21st, 2026)
### Creating the Backend and Finalizing the Analytics and Reports Dashboard
This sprint centers on strengthening backend APIs and implementing the analytics dashboard. Our team will build endpoints for aggregating client data and create visual insights for users, such as activity reports and performance metrics. The goal is to deliver a functional and intuitive analytics experience.

## Sprint 8 (Mar 22nd -> Apr 5th, 2026)
### Creating and Displaying AI Clients' Recommendations
This sprint introduces AI-driven recommendations based on client behavior, tags, and historical data. The system will begin generating suggestions for follow-ups, project ideas, or communication strategies. 

## Sprint 9 (Apr 6th -> Apr 18th, 2026)
### Create AI-Based Scoring
Our team will implement an algorithmic scoring system to evaluate client engagement, risk, and opportunity levels. This feature will use multiple weighted attributes to generate a clear, data-backed client score. The scoring model will help HeadWord! prioritize their workflows and guide strategic planning.

# Login and Dashboard Pictures!
<p align="center">
  <img src="docs/AnalyticsDashPic.jpg" alt="Analytics Dashboard" width="500">
</p>

<p align="center">
  <img src="docs/LoginPic.jpg" alt="Login Page" width="300">
</p>



