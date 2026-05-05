# 📊 Progress Tracker

## Distributed Code Execution & Evaluation Engine

---

## 🧠 Purpose of This Document

This file serves as the **single source of truth for the current state of development**.

It ensures that:

* Work is **structured and sequential**
* Progress is **visible and trackable**
* Decisions are **documented and justified**
* Development can **resume seamlessly across sessions**

---

## ⚠️ Rules for Maintaining This File

1. This file must be updated **after every meaningful implementation step**
2. No work is considered complete unless reflected here
3. Open questions must be documented BEFORE proceeding
4. Architecture decisions must include reasoning
5. Session notes must allow a new engineer to resume instantly

---

## 🚦 Current Phase

### Phase 2 — Robust Execution

**Status:** In Progress 🟡

---

### 🎯 Phase Objective

Enhance the core pipeline with **reliability, security limits, and multi-language support**.

This phase focuses on:
* Enforcing resource constraints (Time, Memory, CPU)
* Handling compilation for static languages (C++, Java)
* Capturing granular error states (TLE, RTE, CE)

---

## 🎯 Current Goal

### Implement Resource Limits and Compilation Handling

This includes:
* Enforcing execution time limits in the Worker
* Enforcing memory limits via Docker
* Setting up compilation environment for C++ and Java
* Returning structured error results back to the engine

---

## ✅ Completed

### 🟢 Phase 1 — Core Execution Pipeline (FOUNDATION)

**Status:** Completed ✅ (2024-05-04)

**Deliverables:**
* **API Service**: Job submission, validation, and Kafka producer.
* **Kafka Setup**: Message broker with `job_submissions` and `job_results` topics.
* **Scheduler Service**: Round-robin job dispatching to workers.
* **Worker Service (C++)**: Secure Docker-based execution (Python MVP).
* **Result Flow**: Async result retrieval via Kafka and API polling.
* **Common Package**: Shared schemas and types (`@engine/common`).

---

### 🟢 System Design & Initialization
* Defined project scope and system goals
* Established architectural boundaries and invariants
* Finalized distributed architecture and service boundaries

---

## 🔄 In Progress

### 🟡 Phase 2: Robustness & Scaling

**Status:** Initializing

#### Tasks Breakdown
* [x] Add time limits enforcement in Worker (C++)
* [x] Add memory limits enforcement in Docker runtime
* [x] Implement compilation handling for C++
* [x] Implement compilation handling for Java
* [x] Enhance error handling (CE, RTE, TLE, MLE)
* [ ] Add worker health logging

---

## ⏭️ Next Up

### 1. Worker Enhancement (C++)
* Use `rlimit` or similar for process-level constraints
* Refactor Docker command to support file mounting for static compilation

### 2. Multi-Language Support
* Build Docker images for C++ and Java
* Implement compile-then-run logic in Worker

---

## ❓ Open Questions

### 🔸 Execution Model
* Should each test case run in a separate container for Phase 2? (Decision: Stick to same container for now, reset environment between runs).

### 🔸 Result Persistence
* When to introduce PostgreSQL? (Decision: Phase 4 as per plan).

---

## 🏗️ Architecture Decisions

### 🟢 Use C++ for Worker Runtime
**Decision:** C++
**Reasoning:** High performance, fine-grained control over system calls (rlimit), and alignment with `architecture.md`.

### 🟢 Shared Common Package
**Decision:** `@engine/common`
**Reasoning:** Ensures type safety and schema consistency across distributed services.

---

## 🧭 Session Notes

### Current Understanding
* Phase 1 is verified end-to-end.
* API, Scheduler, and Worker are communicating correctly via Kafka and HTTP.
* Docker is successfully sandboxing the execution.

### Immediate Next Action
➡️ Implement **Time and Memory Limits** in the C++ Worker.

---

## 🚀 Summary
Phase 1 has established a solid foundation. The system is now ready for production-grade hardening.
