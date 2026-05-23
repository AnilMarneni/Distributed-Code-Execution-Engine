# Secure Multi-Language Code Execution Platform

A polished, systems-focused MERN stack application designed to securely execute and evaluate untrusted user code in C++, Python, and JavaScript. The system utilizes Docker containerization to enforce basic security constraints (CPU, memory, process limits, and network isolation) and persists execution records in MongoDB.

Built as a portfolio project demonstrating REST API design, isolated code execution pipelines, and systems programming concepts for SDE and backend engineering roles.

---

## 🏗️ System Architecture

The platform runs a lightweight execution pipeline:

```
React Frontend (Vite)
         ↓  [HTTP REST: POST submissions / GET check status]
Express.js Backend (Node.js)
         ↓  [child_process: spawns ephemeral Docker containers]
Docker Sandbox Execution
   ├── C++ (gcc:latest)
   ├── Python (python:3.11-slim)
   └── JavaScript (node:18-alpine)
         ↓  [Mongoose ODM]
MongoDB Database
```

### Request Lifecycle
1. **Submission**: The user writes code in the Monaco Editor and triggers "Run Code" with an input and expected output.
2. **Persistence**: The backend immediately saves the job in MongoDB in a `PENDING` state and returns the `submissionId`.
3. **Execution**: An asynchronous background process writes the code to a temporary file, normalizes path mappings, and spins up a Docker container with resource constraints.
4. **Evaluation**: The backend captures stdout/stderr and compares them against the expected outputs, assigning a final verdict (`AC`, `WA`, `TLE`, `RTE`, `CE`).
5. **Retrieval**: The frontend periodically polls the backend's status route. Once the job transitions from `RUNNING` to `COMPLETED`, the frontend displays the evaluated verdicts, execution logs, and runtime statistics.

---

## 🔒 Security Sandbox Model

To safely run untrusted programs, the execution pipeline wraps runtime commands inside short-lived, isolated Docker containers using the following system guardrails:
* **No Network Access (`--network none`)**: Prevents programs from executing network requests, mining, or exporting system data.
* **Memory Limits (`--memory 128m --memory-swap 128m`)**: Restricts maximum RAM consumption to 128MB. Containers exceeding this limit are terminated by the Docker daemon with Exit Code `137`.
* **Execution Timeouts (`timeout`)**: Automatically terminates infinite loops. Runtimes exceeding the execution limit (default 2 seconds) are killed, returning Exit Code `124`.
* **Process Throttling (`ulimit -u 30`)**: Restricts the container to a maximum of 30 active processes to prevent standard fork-bomb attacks.
* **CPU Constraints (`--cpu-quota=50000`)**: Allocates a maximum of 0.5 CPU cores to prevent CPU hijacking.

---

## 🛠️ Quick Start (Local Setup)

### Prerequisites
* **Node.js** (v18+)
* **Docker Desktop** (running local daemon)

### 1. Spin up MongoDB Database
Run MongoDB inside a lightweight Docker container:
```powershell
docker-compose up -d mongodb
```

### 2. Configure & Run Backend
1. Navigate to the backend directory:
   ```powershell
   cd backend
   npm install
   ```
2. Run in development mode:
   ```powershell
   npm run dev
   ```
   The backend API will run on **`http://localhost:5000`**.

### 3. Configure & Run Frontend
1. Navigate to the frontend directory in a new terminal:
   ```powershell
   cd frontend
   npm install
   ```
2. Start the Vite dev server:
   ```powershell
   npm run dev
   ```
   Visit **`http://localhost:5173`** to access the web interface.

---

## 🔌 API Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/submissions` | Submit code, language, and testcases for execution. Returns a `submissionId` |
| `GET` | `/api/submissions` | Fetch latest 20 submissions for the history log |
| `GET` | `/api/submissions/:id` | Retrieve status, outputs, run time, and verdicts for a specific submission |
| `GET` | `/api/health` | Service health status check |

---

## 📂 Project Structure

```
code-execution-platform/
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB connection handler
│   │   ├── controllers/     # Route logic for code submission & fetches
│   │   ├── models/          # Mongoose schema definitions
│   │   ├── routes/          # Express REST endpoint maps
│   │   └── sandbox/         # Docker command constructor & subprocess spawning
│   ├── temp/                # Local volume for temporary execution scripts
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React OutputPanel component
│   │   ├── App.jsx          # Monaco Editor setup & API polling loop
│   │   ├── index.css        # Clean developer-themed CSS styling
│   │   └── main.jsx
│   └── package.json
│
└── docker-compose.yml       # Spins up database container
```

---

## 🧠 Key Challenges & Solutions

### 1. Windows Host and WSL Docker Mounts
* **Challenge**: Because the host runs on Windows, `path.resolve` outputs Windows paths containing backslashes (e.g. `E:\temp`). Docker commands run via Windows CLI translate volume mounts poorly when backslashes are unescaped.
* **Solution**: Implemented path normalization in the sandbox constructor to replace all backslashes with forward slashes (`replace(/\\/g, '/')`). This ensures paths mount seamlessly between Windows hosts and WSL Docker containers.

### 2. Optimizing C++ Compilation
* **Challenge**: Standard execution pipelines compile C++ files inside a new container for every testcase, introducing immense overhead.
* **Solution**: Optimized the workflow by compiling the C++ file *once* inside a compiler container. The resulting Linux binary is output to the host's temp directory and mounted read-only during execution loops, avoiding duplicate compilations.

---

## 🎓 Future Scope & Learnings
* **What I Learned**: Building this project provided a hands-on understanding of Docker sandboxing constraints, process timeouts, mapping Windows/Unix directories, and managing state machines using MongoDB and REST APIs.
* **Future Work**: Adding support for user authentication (JWT), batch-evaluating multiple test cases simultaneously to improve latency, and supporting code templates.
