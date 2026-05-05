# 🏗️ Architecture Context

## Distributed Code Execution & Evaluation Engine

---

## 🧠 Architectural Philosophy

This system is designed as a **distributed, decoupled, and fault-tolerant execution platform** for running untrusted user code securely at scale.

The architecture follows these core principles:

* **Strict Separation of Concerns** — ingestion, scheduling, execution, and evaluation are independent services
* **Asynchronous Processing First** — all heavy operations are decoupled via message queues
* **Zero Trust Execution Model** — all user code is treated as malicious
* **Horizontal Scalability** — every component can scale independently
* **Deterministic Execution** — same input must always produce the same output

---

## ⚙️ Stack

| Layer            | Technology              | Role                                                     |
| ---------------- | ----------------------- | -------------------------------------------------------- |
| API Layer        | Node.js (Express) / Go  | Handles client requests, validation, job creation        |
| Communication    | gRPC                    | Internal service-to-service communication                |
| Queue            | Apache Kafka            | Job buffering, decoupling, and high-throughput messaging |
| Scheduler        | Custom Service (Go/C++) | Assigns jobs to workers based on load                    |
| Worker Runtime   | C++ + Docker            | Executes code inside sandbox                             |
| Containerization | Docker                  | Secure isolated execution environment                    |
| Orchestration    | Kubernetes (optional)   | Auto-scaling worker nodes                                |
| Database         | PostgreSQL              | Persistent job metadata and results                      |
| Cache            | Redis                   | Fast job status lookup and result caching                |
| Monitoring       | Prometheus + Grafana    | Metrics and observability                                |
| Logging          | ELK Stack               | Centralized logging                                      |

---

## 🧱 System Boundaries

Each service has **strict ownership and responsibilities**. No service should violate these boundaries.

---

### 📁 `/api-service`

**Responsibilities:**

* Accept user submissions
* Validate request payload
* Authenticate user
* Generate job ID
* Push job to queue

**Must NOT:**

* Execute code
* Perform scheduling
* Perform evaluation

---

### 📁 `/submission-service`

**Responsibilities:**

* Normalize incoming jobs
* Attach metadata (limits, language config)
* Serialize job payload for queue

**Must NOT:**

* Execute or evaluate code
* Make scheduling decisions

---

### 📁 `/scheduler-service`

**Responsibilities:**

* Consume jobs from queue
* Maintain worker state (available, busy, dead)
* Assign jobs to workers
* Retry failed jobs

**Must NOT:**

* Execute code
* Store persistent job data

---

### 📁 `/worker-service`

**Responsibilities:**

* Receive assigned jobs
* Create sandbox container
* Compile and execute code
* Enforce time and memory limits
* Return raw execution results

**Must NOT:**

* Access database directly
* Make scheduling decisions
* Persist final results

---

### 📁 `/evaluation-service`

**Responsibilities:**

* Compare outputs with expected results
* Compute pass/fail
* Aggregate test case results

**Must NOT:**

* Execute code
* Modify job state directly

---

### 📁 `/result-service`

**Responsibilities:**

* Store results in database
* Update job status
* Serve result queries

---

### 📁 `/common`

**Responsibilities:**

* Shared data contracts
* Job schema definitions
* Utility libraries

---

## 🧬 Data Flow (End-to-End)

1. Client sends request → API Service
2. API validates → forwards to Submission Service
3. Job created → pushed to Kafka topic `job_submissions`
4. Scheduler consumes job
5. Scheduler assigns job → Worker
6. Worker executes code inside container
7. Worker sends result → Kafka topic `job_results`
8. Evaluation Service processes result
9. Result Service stores final output
10. Client fetches result via API

---

## 🗄️ Storage Model

---

### 🟦 PostgreSQL (Primary Database)

Used for **structured, persistent data**

Stores:

* Job metadata (jobId, status, language)
* Execution summaries
* Test case results
* Timestamps

**Why PostgreSQL?**

* Strong consistency
* Relational structure for job tracking
* Reliable for transactional data

---

### 🟥 Redis (Cache Layer)

Used for **fast access and temporary state**

Stores:

* Job status (pending/running/completed)
* Recently completed results
* Rate limiting counters

**Why Redis?**

* Sub-millisecond latency
* Reduces DB load
* Enables real-time polling

---

### 🟨 Blob/File Storage (Optional)

Used for:

* Large outputs
* Logs
* Code snapshots (if needed)

---

## 🔐 Auth and Access Model

---

### Authentication

* Token-based authentication (JWT)
* Every request must include a valid token

---

### Authorization

* Each job is associated with a user
* Only job owner can:

  * Fetch results
  * Re-run execution

---

### Rate Limiting

* Enforced at API Gateway
* Prevents abuse and spam submissions

---

## ⚖️ Invariants (CRITICAL — MUST NEVER BREAK)

These are **non-negotiable rules** in the system.

---

### 1. Code Execution Isolation

> All user code MUST execute inside a containerized sandbox.

* No execution on host machine
* No shared environment between jobs

---

### 2. No Network Access During Execution

> Execution containers must not have internet access.

* Prevents data exfiltration
* Prevents external attacks

---

### 3. Resource Limits Are Enforced

> Every execution must have strict CPU, memory, and time limits.

* Prevents infinite loops
* Prevents resource exhaustion

---

### 4. API Layer Is Stateless

> API must not hold execution state.

* Enables horizontal scaling
* Prevents bottlenecks

---

### 5. Workers Are Ephemeral

> Workers must not retain state after execution.

* No leftover files
* No cross-job contamination

---

### 6. Queue Is the Single Source of Truth for Job Flow

> All job transitions must go through the queue.

* Prevents race conditions
* Ensures traceability

---

### 7. Idempotent Job Processing

> Retrying a job must not produce inconsistent results.

* Same input → same output

---

### 8. No Direct DB Access from Workers

> Workers must communicate only via queue/services.

* Prevents tight coupling
* Improves scalability

---

## 🔄 Communication Model

---

### External Communication

* REST APIs
* JSON payloads

---

### Internal Communication

* gRPC (preferred)
* Faster and strongly typed

---

### Messaging

* Kafka topics:

  * `job_submissions`
  * `job_results`
  * `dead_letter_queue`

---

## 📈 Scalability Strategy

---

### Horizontal Scaling

* Add more worker nodes
* Increase Kafka partitions
* Scale API instances

---

### Load Distribution

* Scheduler assigns jobs based on:

  * Worker load
  * Availability
  * Health status

---

### Bottleneck Handling

* Queue absorbs spikes
* Auto-scale workers during peak load

---

## ⚠️ Failure Handling Strategy

---

### Worker Failure

* Job retried
* Worker marked unhealthy

---

### Queue Failure

* Kafka replication ensures durability

---

### Execution Failure

* Mark job failed
* Return error logs

---

### System Recovery

* Stateless services restart safely
* Jobs remain in queue

---

## 📊 Observability

---

### Metrics

* Job throughput
* Execution latency
* Worker utilization
* Failure rates

---

### Logging

* Execution logs
* Error logs
* System logs

---

### Alerts

* High failure rate
* Queue backlog spike
* Worker crashes

---

## 🧠 Key Architectural Decisions

---

### Why Kafka over RabbitMQ?

* Higher throughput
* Better partitioning for scaling

---

### Why Docker for Execution?

* Strong isolation
* Industry standard
* Lightweight compared to VMs

---

### Why Separate Scheduler?

* Decouples logic
* Enables smarter load balancing

---

### Why Redis?

* Fast state access
* Reduces DB load

---

## 🚀 Summary

This architecture represents a **production-grade distributed system** built with:

* Clear service boundaries
* Strong security guarantees
* Scalable execution model
* Robust failure handling

It is designed to handle **real-world workloads** similar to large-scale coding platforms while maintaining strict isolation and performance guarantees.

---
