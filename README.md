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
## FRONTEND
Navigate to the local backend directory. Example: "\Users\student\Downloads\CSC 190\frontend"
- cd frontend

(Only need once to download necessary packages for React)
- npm install

Start running the frontend at http://localhost:3001/
- npm run dev

Can view the frontend in browser by navigating to:
- http://localhost:3001/

## BACKEND
Navigate to the local backend directory. Example: "\Users\student\Downloads\CSC 190\backend"
- cd backend

(Only need once to download necessary packages for React)
- npm install

Begin running the backend at http://localhost:3000/	
- npm run start OR npm run start:dev
