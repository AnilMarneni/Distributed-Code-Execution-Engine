# 🧾 Code Standards

## Distributed Code Execution & Evaluation Engine

---

## 🧠 Philosophy

This codebase is designed for a **distributed, security-critical system** that executes untrusted user code. As such, the standards here are **strict, explicit, and non-negotiable**.

Every line of code must satisfy:

* **Correctness first** — incorrect execution is worse than slow execution
* **Security always** — assume adversarial input at all times
* **Determinism** — same input must produce identical output
* **Isolation of concerns** — no component should do more than its defined role
* **Observability** — every failure must be traceable and debuggable

---

## 🧩 General Principles

---

### 1. Single Responsibility Principle (SRP)

Each module, class, and function must have **exactly one reason to change**.

✅ Good:

* `JobValidator` → validates input only
* `Scheduler` → assigns jobs only

❌ Bad:

* A class that validates, schedules, and executes jobs

---

### 2. Explicit Over Implicit

* All assumptions must be encoded explicitly
* No hidden behaviors or side effects

Example:

* Do NOT assume default limits
* Always pass `timeLimit`, `memoryLimit`

---

### 3. Fail Fast, Fail Loud

* Errors must be detected early
* Never silently ignore failures

Example:

* Compilation failure must return explicit error
* Container failure must trigger retry or fail state

---

### 4. No Shared Mutable State

* Especially critical in distributed workers
* Prevent race conditions and cross-job contamination

---

### 5. Idempotency Everywhere

* Retrying a job must not change outcome
* APIs must handle duplicate requests safely

---

### 6. Defensive Programming

* Treat all external input as malicious
* Validate everything at boundaries

---

## 🧠 Language Standards (C++ - Core Execution Layer)

---

### Memory Management

* Prefer **RAII (Resource Acquisition Is Initialization)**
* Use smart pointers:

  * `std::unique_ptr` (default)
  * `std::shared_ptr` (only when necessary)

❌ Avoid:

* Raw pointers
* Manual `new/delete`

---

### Error Handling

* Use structured error handling:

  * Return error objects OR
  * Use exceptions (controlled, not overused)

* Every critical operation must:

  * Return status
  * Log failure

---

### Concurrency

* Use thread-safe constructs:

  * `std::mutex`
  * `std::lock_guard`
  * `std::atomic`

* Avoid:

  * Shared mutable global state
  * Unsafe parallel execution

---

### Execution Safety

* Never execute shell commands without sanitization
* Always validate file paths
* Prevent command injection

---

### Compilation Handling

* Always check:

  * Compiler exit code
  * Compilation logs

---

## 🌐 API Standards

---

### Request Handling

Every API route MUST:

1. Validate input schema
2. Authenticate request
3. Enforce rate limiting
4. Process logic
5. Return structured response

---

### Request Validation

* Use strict schemas
* Reject invalid requests immediately

Example fields:

* `language`
* `code`
* `timeLimit`
* `memoryLimit`

---

### Response Format (STRICT)

All responses must follow:

```json
{
  "status": "success | error",
  "data": {},
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  }
}
```

---

### Idempotency

* Submissions must support idempotency keys
* Duplicate requests must not create duplicate jobs

---

## 🧱 Worker Standards (Execution Layer)

---

### Container Lifecycle

Every job execution must:

1. Create container
2. Inject code
3. Compile
4. Execute
5. Capture output
6. Destroy container

❗ Container must ALWAYS be destroyed — even on failure

---

### Resource Enforcement

Every execution MUST enforce:

* CPU limit
* Memory limit
* Execution timeout

---

### File System Rules

* Use isolated working directory
* No persistent storage
* Clean up all artifacts after execution

---

### Logging

Each worker must log:

* Job ID
* Execution start/end time
* Errors
* Resource usage

---

### No Direct DB Access

Workers must:

* NOT connect to database
* Communicate only via queue or service APIs

---

## 🔐 Security Standards

---

### Sandbox Enforcement

* All code runs inside Docker container
* No host execution

---

### Network Isolation

* Containers must run with:

  * `--network=none`

---

### Process Limits

* Enforce max process count
* Prevent fork bombs

---

### File Access Restrictions

* Read-only filesystem
* No access to host files

---

### Input Sanitization

* Prevent:

  * Command injection
  * Path traversal
  * Malicious payloads

---

## 🧪 Evaluation Standards

---

### Output Comparison

* Exact match by default
* Optional normalization:

  * Trim whitespace
  * Ignore trailing newlines

---

### Per-Test Case Isolation

* Each test case runs independently
* Failure in one must not affect others

---

### Metrics Collection

For each test case:

* Execution time
* Memory usage
* Exit status

---

## 📦 Data and Storage Standards

---

### Database Rules

* Store only metadata
* Keep records normalized

---

### Large Data Handling

* Store large outputs/logs outside DB
* Use blob/file storage if needed

---

### Caching Rules

* Cache frequently accessed results
* Invalidate cache on update

---

## 📁 File Organization

---

### `/api/`

* Route handlers
* Request validation

---

### `/services/`

* Business logic
* Job creation
* Scheduling logic

---

### `/workers/`

* Execution logic
* Container management

---

### `/scheduler/`

* Job distribution logic

---

### `/models/`

* Data structures
* Job schemas

---

### `/utils/`

* Shared utilities
* Logging
* Validation helpers

---

### `/config/`

* Environment configs
* System limits

---

## 📏 Logging Standards

---

### Log Levels

* INFO → normal operations
* WARN → recoverable issues
* ERROR → failures
* DEBUG → detailed traces

---

### Required Fields

Every log must include:

* `jobId`
* `serviceName`
* `timestamp`
* `message`

---

## 📊 Observability Standards

---

### Metrics

Track:

* Job throughput
* Execution latency
* Failure rates
* Worker utilization

---

### Tracing

* Each job must be traceable end-to-end
* Use correlation IDs

---

## 🔄 Testing Standards

---

### Unit Tests

* Validate:

  * Input parsing
  * Execution logic
  * Evaluation logic

---

### Integration Tests

* End-to-end job execution

---

### Load Testing

* Simulate high concurrency
* Validate system stability

---

### Failure Testing

* Kill workers
* Simulate queue delays

---

## 🚫 Anti-Patterns (STRICTLY FORBIDDEN)

---

❌ Executing user code outside container
❌ Skipping input validation
❌ Sharing state between jobs
❌ Ignoring execution limits
❌ Hardcoding configurations
❌ Writing business logic inside API handlers
❌ Allowing silent failures
❌ Storing large outputs in DB

---

## 🧠 Code Review Checklist

Before merging any code:

* [ ] Does it follow SRP?
* [ ] Are all inputs validated?
* [ ] Are limits enforced?
* [ ] Is error handling complete?
* [ ] Are logs sufficient?
* [ ] Does it violate any invariant?
* [ ] Is it secure against malicious input?

---

## 🚀 Summary

These standards ensure that the system remains:

* 🔐 Secure against untrusted code
* ⚡ Efficient under heavy load
* 🧱 Maintainable and modular
* 📈 Scalable and production-ready

Following these strictly will make this project comparable to **real-world execution engines used in large-scale systems**.

---
