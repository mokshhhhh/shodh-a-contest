Real-Time Coding Contest Platform
This repository contains the complete source code for a real-time coding contest platform developed as a full-stack project, featuring a live, containerized code judging backend and a reactive frontend UI.

Project Overview
The platform enables students to join coding contests, solve problems, submit code that is judged live inside Docker containers, and view live leaderboards. The backend is built with Spring Boot, and the frontend is built using React/Next.js with Tailwind CSS. The entire system is dockerized for easy local setup.

Setup Instructions
Follow these steps to set up and run the application locally:

Prerequisites
Docker and Docker Compose installed on your machine

Java JDK 11+ installed (optional if running via Docker only)

Node.js and npm (optional if running frontend separately)

Running with Docker Compose (Recommended)
Clone this repository:

bash
git clone <repository-url>
cd <repository-folder>
Build and start the services:

bash
docker-compose up --build
This will start the backend Spring Boot API server, frontend React application, and the Dockerized judge environment.

Open your browser at http://localhost:3000 to access the frontend UI.

The database is pre-populated with a sample contest and problems for immediate testing.

Running Backend Independently
Navigate to the backend folder:

bash
cd backend
Build the Spring Boot application:

bash
./mvnw clean package
Run the application:

bash
java -jar target/backend-0.0.1-SNAPSHOT.jar
The backend service will start on port 8080.

Running Frontend Independently
Navigate to the frontend folder:

bash
cd frontend
Install dependencies:

bash
npm install
Run the development server:

bash
npm run dev
Access the frontend on http://localhost:3000.

API Design Overview
The backend exposes the following RESTful endpoints:

Endpoint	Method	Description	Request Body	Response
/api/contests/{contestId}	GET	Fetch contest details including problems and info	N/A	JSON with contest details and problems
/api/submissions	POST	Submit code for judging; adds submission to processing queue	{ "userId": "...", "contestId": "...", "problemId": "...", "language": "...", "code": "..." }	{ "submissionId": "..." }
/api/submissions/{submissionId}	GET	Get status and result of a submission	N/A	`{ "status": "<Pending
/api/contests/{contestId}/leaderboard	GET	Get live leaderboard for the contest	N/A	JSON array of users with scores and ranks
Design Choices & Justification
Backend Architecture
Modular Service Design: The backend is structured into layers — REST controllers, service logic, and data repositories — for clear separation of concerns.

Asynchronous Submission Judging: Submissions are queued and processed asynchronously using Java concurrency utilities to ensure scalability and responsiveness.

Docker-based Code Execution: User code runs securely inside isolated Docker containers with strict resource limits (CPU, memory, execution time) to prevent misuse and ensure fairness.

Data Persistence: Uses a relational database to persist users, contests, problems, and submissions, with pre-populated sample data for easy testing.

Frontend State Management
React with Next.js: Provides Server-Side Rendering (SSR) for performance and SEO benefits.

State Management: Local component state and React hooks are used for asynchronous polling and managing UI state since the app is mostly single-user focused per session.

Polling for Real-Time Updates: Submissions status and leaderboard data are polled at intervals to simulate live updates without requiring WebSocket complexity.

Tailwind CSS: Used for a lightweight and customizable styling approach that fast-tracks front-end development.

Docker Orchestration Challenges
Security: Running untrusted user code safely required strict container resource constraints via Docker runtime flags and cleanup automation post-execution.

Performance: Balancing container startup latency with responsiveness necessitated a lightweight base image optimized for the language runtime.

Trade-offs: Chose polling over WebSocket for simplicity and time constraints at the cost of real-time immediacy; container reuse was avoided to preserve isolation, trading some efficiency.

This README aims to comprehensively guide setup, outline API usage, and explain the rationale behind key architectural decisions.