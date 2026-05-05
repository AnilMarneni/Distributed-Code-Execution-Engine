# 🎨 UI Context

## Distributed Code Execution & Evaluation Engine

---

## 🧠 Design Philosophy

This UI is not a decorative layer — it is a **developer-grade interface designed for clarity, control, and deep interaction**.

The design avoids:

* Flashy gradients
* Neon-heavy aesthetics
* Overuse of animations
* “AI dashboard” clichés

Instead, it follows:

### Core Principles

---

### 1. Functional Minimalism

Every element must serve a purpose:

* No decorative components without utility
* No redundant UI elements
* No visual noise

---

### 2. Information Hierarchy First

Users must instantly understand:

* What is primary (code editor)
* What is secondary (output/results)
* What is contextual (logs, metadata)

Visual weight must reflect importance.

---

### 3. Developer Ergonomics

UI must optimize for:

* Long usage sessions
* Reduced eye strain
* Fast navigation
* Precision interaction

---

### 4. Customization as a First-Class Feature

Unlike most systems, this UI treats customization as a **core capability**, not an afterthought.

Users must be able to control:

* Typography
* Color palette
* Layout density
* Editor behavior
* Visual preferences

---

### 5. Predictability Over Surprise

* No unexpected UI shifts
* No hidden interactions
* No implicit behavior

Everything must feel **stable and consistent**.

---

## 🎨 Theme System

---

### Theme Modes

* Dark (default)
* Light
* Custom themes (user-defined)

---

### Theme Philosophy

* Neutral base tones
* Subtle contrast
* Accent colors used sparingly
* Avoid visual fatigue

---

### Base Themes

---

#### Dark Theme (Primary)

* Deep gray background (not pure black)
* Layered surfaces
* Soft contrast

---

#### Light Theme

* Warm off-white base
* Gentle shadows
* Reduced glare

---

#### Custom Theme Engine

Users can override:

* All color tokens
* Accent palette
* Syntax highlighting colors

---

## 🎨 Color System (Token-Based)

All colors must be defined as CSS variables.

---

### Core Tokens

| Role             | Variable           | Description               |
| ---------------- | ------------------ | ------------------------- |
| Base Background  | `--bg-base`        | Main app background       |
| Surface          | `--bg-surface`     | Panels/cards              |
| Elevated Surface | `--bg-elevated`    | Modals/overlays           |
| Primary Text     | `--text-primary`   | Main readable text        |
| Secondary Text   | `--text-secondary` | Less emphasis             |
| Muted Text       | `--text-muted`     | Metadata                  |
| Accent           | `--accent-primary` | Primary interactive color |
| Accent Soft      | `--accent-soft`    | Hover states              |
| Border           | `--border-default` | Dividers                  |
| Success          | `--state-success`  | Passed test cases         |
| Error            | `--state-error`    | Failed execution          |
| Warning          | `--state-warning`  | Edge conditions           |

---

### Rules

* No hardcoded hex values anywhere
* All components must use tokens
* Contrast must meet accessibility standards

---

## ✍️ Typography System

---

### Philosophy

Typography is the **primary UX tool** in this system.

It defines:

* Readability
* Hierarchy
* Density
* Focus

---

### Font Families

| Role    | Font                       | Variable      |
| ------- | -------------------------- | ------------- |
| UI Text | Inter / Geist Sans         | `--font-sans` |
| Code    | JetBrains Mono / Fira Code | `--font-mono` |

---

### Font Customization (User-Controlled)

Users can adjust:

* Font family
* Font size
* Line height
* Letter spacing
* Font weight

---

### Typography Scale

| Role | Size    | Usage           |
| ---- | ------- | --------------- |
| XS   | 12px    | Metadata        |
| SM   | 14px    | Secondary text  |
| Base | 16px    | Default UI      |
| LG   | 18px    | Headings        |
| XL   | 20–24px | Section headers |

---

### Code Editor Typography

* Monospaced font only
* Adjustable:

  * Font size
  * Line spacing
  * Cursor thickness
  * Ligatures (on/off)

---

## 🧱 Layout System

---

### Global Layout Structure

```id="zklr7c"
-----------------------------------------
| Navbar                                 |
-----------------------------------------
| Sidebar | Editor | Output / Results    |
-----------------------------------------
```

---

### Regions

---

#### 1. Navbar (Top Bar)

* Project name
* Run button
* Language selector
* Settings access

---

#### 2. Sidebar (Left)

* File tree
* Submission history
* Test cases

---

#### 3. Editor (Center — Primary Focus)

* Code editor
* Syntax highlighting
* Cursor + selection

---

#### 4. Output Panel (Right)

* Execution results
* Logs
* Test case breakdown

---

### Layout Customization

Users can:

* Resize panels (drag)
* Collapse sections
* Switch between:

  * Horizontal layout
  * Vertical layout

---

## 🧩 Component System

---

### Core Components

---

#### Code Editor

* Syntax highlighting
* Line numbers
* Error markers
* Multi-cursor support

---

#### Output Console

* Streamed output
* Colored logs
* Scrollable history

---

#### Test Case Viewer

* Expandable test cases
* Pass/fail indicators
* Execution metrics

---

#### Run Controls

* Run button
* Stop execution
* Re-run

---

#### Status Indicators

* Execution state:

  * Running
  * Success
  * Failed
  * Timeout

---

## 🎛️ Customization System (DETAILED)

---

### 🎨 Visual Customization

Users can adjust:

* Theme (dark/light/custom)
* Accent color
* Border radius
* Shadow intensity

---

### ✍️ Typography Customization

* Font family
* Font size (UI + editor)
* Line height
* Letter spacing

---

### 🧱 Layout Customization

* Panel sizes
* Panel positions
* Density (compact / comfortable)

---

### 🧪 Editor Customization

* Tab size
* Auto-indent
* Syntax theme
* Cursor style
* Line highlight
* Minimap (on/off)

---

### 🎯 Interaction Customization

* Keyboard shortcuts
* Mouse behavior
* Scroll speed

---

## 📏 Spacing & Density System

---

### Density Modes

---

#### Compact

* Reduced padding
* More information per screen

---

#### Comfortable (Default)

* Balanced spacing

---

#### Spacious

* Increased padding
* Better readability

---

### Spacing Scale

| Token | Value |
| ----- | ----- |
| XS    | 4px   |
| SM    | 8px   |
| MD    | 12px  |
| LG    | 16px  |
| XL    | 24px  |

---

## 🔲 Border Radius System

---

| Context        | Value |
| -------------- | ----- |
| Small elements | 4px   |
| Cards          | 8px   |
| Panels         | 12px  |
| Modals         | 16px  |

---

## 🔔 Feedback & States

---

### Execution States

* Running → subtle animation
* Success → green indicator
* Failure → red indicator
* Timeout → amber indicator

---

### Interaction Feedback

* Hover → slight background shift
* Active → stronger contrast
* Focus → visible outline

---

## 🎞️ Motion & Animation

---

### Philosophy

* Minimal
* Functional
* Fast

---

### Allowed Animations

* Panel resize
* Output streaming
* Loading indicators

---

### Forbidden

* Decorative animations
* Excessive transitions

---

## 🧭 Navigation Principles

---

* No deep nesting
* Flat structure
* Keyboard-first navigation

---

## 🧩 Icons

---

* Use stroke-based icons (Lucide style)
* Sizes:

  * Inline → 16px
  * Buttons → 20px

---

## ♿ Accessibility

---

* High contrast mode
* Keyboard navigation support
* Screen reader compatibility

---

## 🧠 Design Constraints

---

* UI must never block execution flow
* UI must remain responsive under load
* No dependency on animation for usability

---

## 🚫 Anti-Patterns

---

❌ Overusing accent colors
❌ Hardcoded styles
❌ Hidden interactions
❌ Cluttered layouts
❌ Non-customizable UI
❌ Mixing UI and execution logic

---

## 🚀 Summary

This UI is designed to feel like a:

👉 **Professional developer tool**
👉 Not a flashy demo
👉 Not a generic AI interface

It prioritizes:

* Clarity
* Control
* Customization
* Performance

And creates an experience that scales from:

* Beginners → Advanced users
* Small inputs → Large workloads

---
