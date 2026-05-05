# 🚀 Distributed Code Execution & Evaluation Engine

---

## 🧠 Overview

The **Distributed Code Execution & Evaluation Engine** is a production-grade, highly scalable, and security-focused system designed to execute **untrusted user-submitted code** in a controlled environment and evaluate it against predefined test cases.

This system is built to simulate the core infrastructure behind platforms such as LeetCode, HackerRank, and internal technical assessment systems used by companies.

At its core, the system solves a **high-risk, high-complexity problem**:

> How do you safely execute arbitrary, potentially malicious code submitted by users, while ensuring correctness, performance, and scalability?

To address this, the system combines:

* Distributed systems design
* Container-based sandboxing
* Asynchronous processing
* Deterministic evaluation pipelines

---

## 🎯 Problem Definition

Executing user-submitted code introduces several critical challenges:

### 🔐 Security Risks

* Code may attempt:

  * Infinite loops (CPU exhaustion)
  * Memory exhaustion
  * File system access
  * Network calls (data exfiltration)
  * Fork bombs or process spawning

### ⚡ Performance Constraints

* Thousands of users may submit code simultaneously
* Each submission may include multiple test cases
* Execution must be fast and predictable

### 📈 Scalability Requirements

* Must handle bursts of traffic
* Must scale horizontally across machines
* Must not degrade under load

### 🎯 Evaluation Accuracy

* Outputs must be compared precisely
* Edge cases must be handled correctly
* Results must be deterministic

---

## 🧩 System Goals

---

### 1. Secure Execution (Non-Negotiable)

* All code must execute in **isolated sandbox environments**
* No direct interaction with host system
* No shared state between executions
* Zero tolerance for sandbox escape

---

### 2. High Scalability

* Support **1000+ concurrent jobs**
* Horizontal scaling via distributed workers
* Queue-based buffering for burst handling

---

### 3. Deterministic Evaluation

* Same input → same output every time
* No non-deterministic behavior
* Strict output comparison

---

### 4. Multi-Language Support

* Initial:

  * C++
  * Python
  * Java

* Extensible:

  * Plug-and-play language support

---

### 5. Fault Tolerance

* Worker failure must not lose jobs
* Retry mechanisms must exist
* System must recover gracefully

---

### 6. Observability

* Every job must be traceable
* Logs must capture execution details
* Metrics must reflect system health

---

## 🔄 End-to-End System Flow

---

### 🟢 Step 1: Code Submission

User submits:

* Source code
* Language
* Optional custom input
* Problem ID or test cases

---

### 🟢 Step 2: Validation

System validates:

* Code size limits
* Language support
* Input format
* Resource constraints

---

### 🟢 Step 3: Job Creation

* Unique `jobId` generated
* Job metadata structured:

  * Language
  * Time limit
  * Memory limit
  * Test cases

---

### 🟢 Step 4: Queue Insertion

* Job pushed into message queue
* System becomes asynchronous
* API responds immediately

---

### 🟢 Step 5: Scheduling

* Scheduler picks job
* Assigns to available worker
* Balances load across nodes

---

### 🟢 Step 6: Execution

Worker performs:

1. Create isolated container
2. Inject code
3. Compile (if needed)
4. Execute test cases
5. Capture output

---

### 🟢 Step 7: Evaluation

* Output compared with expected result
* Pass/fail computed
* Metrics recorded

---

### 🟢 Step 8: Result Storage

* Results stored in DB
* Cached in Redis

---

### 🟢 Step 9: Result Retrieval

User fetches:

* Status
* Output
* Metrics
* Logs

---

## ⚙️ Core System Components

---

### 📦 1. API Layer

Handles:

* Code submission
* Result fetching
* Authentication
* Rate limiting

---

### 🧾 2. Submission Service

Handles:

* Job creation
* Payload structuring
* Queue publishing

---

### 🔄 3. Message Queue

Acts as:

* Buffer between services
* Decoupling mechanism
* Load balancer

---

### 🧠 4. Scheduler

Handles:

* Job assignment
* Worker tracking
* Retry logic

---

### 🧱 5. Worker Nodes

Core execution engine:

* Runs code inside containers
* Enforces limits
* Returns results

---

### 🧪 6. Evaluation Engine

Handles:

* Output comparison
* Result aggregation

---

### 📊 7. Result Service

Handles:

* Storing results
* Serving queries

---

### 🧠 8. Cache Layer

* Fast result lookup
* Reduces DB load

---

## 🧪 Execution Model

---

### Per Job

* Each job is independent
* No shared memory or state

---

### Per Test Case

Two possible models:

1. Same container (faster)
2. Separate container (more secure)

(Default: same container with strict reset)

---

## 🔐 Security Model

---

### Isolation

* Docker containers
* Namespaces + cgroups

---

### Restrictions

* No network access
* Limited CPU and memory
* Process limits enforced

---

### Execution Control

* Timeouts enforced
* Infinite loops terminated

---

## 📊 Output & Evaluation

---

### Metrics per Test Case

* Execution time
* Memory usage
* Exit code

---

### Result Types

* Accepted (AC)
* Wrong Answer (WA)
* Time Limit Exceeded (TLE)
* Runtime Error (RTE)
* Compilation Error (CE)

---

## 📌 Feature Breakdown

---

### Submission Features

* Multi-language support
* Batch test execution
* Custom input runs

---

### Execution Features

* Secure sandbox
* Resource limits
* Deterministic behavior

---

### Evaluation Features

* Output comparison
* Per-test-case results

---

### Result Features

* Detailed logs
* Metrics tracking
* Status updates

---

## 📏 Scope Definition

---

### ✅ In Scope

* Distributed execution system
* Secure sandboxing
* Queue-based architecture
* Evaluation engine
* Worker orchestration

---

### ❌ Out of Scope

* Full IDE features
* AI code suggestions
* Collaborative editing
* Advanced judging (floating tolerance)

---

## 📊 Success Criteria

---

### Functional

* All jobs execute correctly
* Results are accurate

---

### Performance

* Low latency execution
* High throughput

---

### Security

* No sandbox escape
* No system compromise

---

### Scalability

* Linear scaling with workers

---

### Reliability

* No job loss
* Graceful failure handling

---

## 🧠 Key Design Philosophy

---

### Zero Trust Execution

Treat all code as malicious.

---

### Decoupled Systems

Each component is independent.

---

### Horizontal Scaling

Scale out, not up.

---

### Deterministic Results

Consistency above all.

---

### Fail Fast, Recover Fast

Detect issues early and recover automatically.

---

## 🚀 Summary

This project represents a **real-world distributed execution system** combining:

* Secure sandboxing
* Distributed job processing
* Scalable architecture
* Deterministic evaluation

It demonstrates deep understanding of:

* System design
* Backend engineering
* Distributed systems
* Security engineering

This is not just a project — it is a **production-level system blueprint**.

---
