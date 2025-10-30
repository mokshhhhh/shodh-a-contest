<h1> Real-Time Coding Contest Platform </h1>
This repository contains the complete source code for a real-time coding contest platform developed as a full-stack project, featuring a live, containerized code judging backend and a reactive frontend UI.

Project Overview
The platform enables students to join coding contests, solve problems, submit code that is judged live inside Docker containers, and view live leaderboards. The backend is built with Express.js, and the frontend is built using React.js with Tailwind CSS. The entire system is dockerized for easy local setup.

Setup Instructions
Follow these steps to set up and run the application locally:

Prerequisites :-
-Docker and Docker Compose installed on your machine
-Node.js and npm 
-Running with Docker Compose

Clone this repository:
-bash
-git clone https://github.com/mokshhhhh/shodh-a-contest.git
-cd <repository-folder>

Build and start the services:

-bash
-docker-compose up --build
-This will start the backend API server, frontend React application, and the Dockerized judge environment.

Open your browser at http://localhost:5173 to access the frontend UI.

The database is pre-populated with a sample contest and problems for immediate testing.


Backend Architecture & Workflow
1. REST API Server
Built with Express.js—minimal, stateless, and rapid for real-time judging and problem delivery.

Cross-origin (CORS) enabled for frontend communication.

JSON parsing for large (~512KB) code payloads.

2. Problem Management
Problems Directory:
All coding problems are stored as .json files in a dedicated problems/ directory.

Endpoints:

GET /problems returns metadata (id, name, description, io_format) for all available problems.

GET /problems/:id fetches complete details and testcases for a specific problem.

Benefits:
File-based problems make it easy to add/edit questions without database migration.

3. Judging & Code Execution
Endpoints:

POST /run
Executes user code in a Docker container, with user-provided or problem test input (ad-hoc single test).

Payload: { language, code, input?, problemId?, testIndex? }

Output: stdout, stderr, exit code, execution time, timeout flag.

POST /submit
Runs code against all official test cases for a problem and returns a verdict ('ACCEPTED' or 'REJECTED') along with per-test results.

Payload: { language, code, problemId }

Output: detailed verdict/test results.

How Judging Works:

Each run spins up a fresh Docker container with only the required runtime (Python/C++).

Code and test input are mounted as files inside /work, with strict resource limits:

No outgoing network (--network none)

CPU limit: 0.5 cores

RAM limit: 256MB

PIDs limit: 128

Custom max execution time (4sec default)



4. Docker Runner
Centralized file: dockerRunner.js

Supported Languages: Python 3.10 (alpine), C++ (GCC latest). Easily extensible through config and new Docker images.



Typical Submission/Run Flow
For /run:

Receive code and input.

Store as files in temp directory.

Boot Docker container, run code with input, apply limits.

Collect (stdout, stderr, exit code, timing, timeout).

Respond with result and auto-clean temp files.

For /submit:

For each problem testcase, repeat the above (all testcases in series; could parallelize in future).

Compare output to expected and return a pass/fail for each.


Scalability and Extensibility
Languages:
New languages can be added by extending runInDocker with appropriate Docker images and run scripts.

Problems/Contests:
Can be expanded or managed via filesystem or eventually backed by a database for write-heavy production scenarios.

Security:
Further defense (e.g., seccomp/docker UID sandbox) can be added for production or open-internet usage.


