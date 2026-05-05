# 🤖 AI Workflow Rules

## Distributed Code Execution & Evaluation Engine

---

## 🧠 Core Philosophy

This project must be developed using a **strict, spec-driven, incremental workflow**.

At no point should implementation decisions be based on guesswork, assumptions, or implicit behavior. Every line of code must trace back to a clearly defined requirement in the context files.

This system is **security-critical and distributed**, meaning:

* Mistakes compound across services
* Undefined behavior leads to system instability
* Small architectural violations become large-scale failures

Therefore, development must be:

* **Deterministic**
* **Auditable**
* **Incremental**
* **Bounded by specifications**

---

## 📜 Source of Truth Hierarchy

All development decisions must follow this strict priority order:

1. `architecture.md` → Defines system boundaries and invariants
2. `project-overview.md` → Defines system behavior and scope
3. `code-standards.md` → Defines how code must be written
4. `progress-tracker.md` → Defines current state and next actions

---

### 🔴 Rule

> If implementation contradicts any context file, the implementation is wrong — not the spec.

---

## 🧩 Development Approach

---

### Spec-Driven Development (MANDATORY)

Every feature must follow:

1. Define requirement in context file
2. Break into smallest unit of work
3. Implement exactly that unit
4. Verify end-to-end
5. Update context files
6. Move to next unit

---

### No Implicit Behavior

* Do NOT infer system behavior
* Do NOT assume defaults
* Do NOT “fill in gaps”

If something is unclear:
➡️ Add it to `progress-tracker.md` as an **Open Question**

---

### Deterministic Progress

Each development step must:

* Have a clear start and end
* Be testable independently
* Not depend on incomplete features

---

## 📦 Scoping Rules

---

### Work Unit Definition

A "unit of work" must satisfy:

* Can be implemented in isolation
* Can be verified independently
* Does not cross multiple system boundaries

---

### Examples of VALID units

* Implement job submission API
* Add Kafka producer for job queue
* Implement worker container execution logic

---

### Examples of INVALID units

* "Build entire execution system"
* "Implement API + worker + scheduler together"
* "Add feature + refactor + optimize in one step"

---

### Golden Rule

> If you cannot test it end-to-end in one sitting, the unit is too large.

---

## ✂️ When to Split Work

---

Split an implementation step if it combines:

### 1. Multiple System Boundaries

Example:

* API + Scheduler + Worker → ❌ Split into 3 units

---

### 2. Multiple Concerns

Example:

* Validation + execution + storage → ❌ Split

---

### 3. Undefined Behavior

Example:

* Feature depends on unclear requirement → ❌ Resolve first

---

### 4. Hard-to-Verify Changes

Example:

* Large refactor without clear test → ❌ Break down

---

## 🧠 Feature Development Lifecycle

---

### Step 1: Define Requirement

Add or refine in:

* `project-overview.md`
* `architecture.md`

---

### Step 2: Identify Boundaries

Determine:

* Which service owns this feature
* What it must NOT do

---

### Step 3: Define Contracts

Define:

* Input schema
* Output schema
* Error cases

---

### Step 4: Implement

* Follow `code-standards.md`
* Respect all invariants

---

### Step 5: Validate

* Test end-to-end
* Simulate edge cases

---

### Step 6: Update Context

Update:

* `progress-tracker.md`
* Any affected context file

---

## ❗ Handling Missing or Ambiguous Requirements

---

### STRICT RULE

> Never invent behavior.

---

### If Requirement is Missing

1. Add to `progress-tracker.md` → Open Questions
2. Do NOT proceed with assumptions
3. Resolve before implementation

---

### If Requirement is Ambiguous

* Clarify in context file
* Define exact expected behavior

---

### Example

Ambiguous:

> "Handle execution errors"

Resolved:

* Define:

  * Timeout → status = TLE
  * Runtime error → status = RTE
  * Compilation error → status = CE

---

## 🛑 Protected Files and Areas

---

These areas must NOT be modified casually:

---

### 🔐 Security Configurations

* Docker runtime configs
* Resource limits
* Isolation policies

---

### 🔁 Queue Contracts

* Kafka message schemas
* Topic structures

---

### 📦 Shared Schemas

* Job payload format
* Result format

---

### ⚙️ Core Execution Logic

* Worker execution engine

---

### Rule

> Any modification to these requires updating architecture.md AND documenting rationale.

---

## 🔄 Keeping Context Files in Sync

---

Every meaningful change must update relevant context:

---

### Update `architecture.md` if:

* New service added
* Boundaries changed
* Data flow modified

---

### Update `project-overview.md` if:

* Feature added/removed
* Scope changed

---

### Update `code-standards.md` if:

* New coding rules introduced
* Security practices updated

---

### Update `progress-tracker.md` ALWAYS:

* After every completed unit

---

## ✅ Definition of Done (DoD)

---

A unit of work is COMPLETE only if:

---

### 1. Functional Completion

* Works end-to-end within defined scope

---

### 2. Invariant Compliance

* No rule in `architecture.md` is violated

---

### 3. Code Quality

* Follows all `code-standards.md`

---

### 4. Observability

* Logs and metrics added

---

### 5. Documentation Updated

* Context files updated

---

### 6. Build Stability

* System builds successfully
* No regressions introduced

---

## 🧪 Verification Strategy

---

Each unit must include:

---

### Functional Testing

* Does it work as expected?

---

### Edge Case Testing

* Invalid input
* Resource limits
* Failure scenarios

---

### Integration Testing

* Does it interact correctly with other services?

---

### Failure Simulation

* Worker crash
* Queue delay
* Timeout

---

## 🔁 Iteration Strategy

---

### Phase-Based Development

---

### Phase 1: Core Pipeline

* API → Queue → Worker → Result

---

### Phase 2: Robustness

* Retries
* Failure handling
* Logging

---

### Phase 3: Scaling

* Multiple workers
* Load balancing

---

### Phase 4: Optimization

* Container reuse
* Caching

---

## 🚫 Anti-Patterns (STRICTLY FORBIDDEN)

---

❌ Implementing features without updating context files
❌ Writing code before defining contracts
❌ Combining multiple services in one module
❌ Skipping validation “for now”
❌ Hardcoding assumptions
❌ Ignoring failure cases
❌ Bypassing queue for “quick testing”
❌ Direct worker → DB communication

---

## 🧠 Developer Discipline Rules

---

### Rule 1: Think in Systems, Not Files

Every change affects:

* Data flow
* Load distribution
* Failure modes

---

### Rule 2: Design Before Code

* Write structure first
* Then implement

---

### Rule 3: Optimize Later

* First make it correct
* Then make it fast

---

### Rule 4: Security Is Default

* Never “add later”

---

### Rule 5: Small Wins Only

* Each step must move system forward safely

---

## 📊 Progress Tracking Discipline

---

After EACH unit:

Update:

* Current Phase
* Completed
* In Progress
* Next Up
* Open Questions

---

### Rule

> If progress-tracker.md is outdated, the system is considered undocumented.

---

## 🧭 Session Continuity Rules

---

Before ending a session:

* Document:

  * What was done
  * What remains
  * Any blockers

---

Before starting next session:

* Read `progress-tracker.md`
* Resume from last state

---

## 🚀 Summary

This workflow ensures:

* 🧠 Structured thinking
* 🔐 Secure implementation
* ⚙️ Predictable progress
* 📈 Scalable architecture
* 🧱 Maintainable codebase

It transforms the project from:

👉 “just code”
into
👉 “a production-grade engineered system”

---
