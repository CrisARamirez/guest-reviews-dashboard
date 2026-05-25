# AI Prompts & Development Process

This document captures how AI was used **during development** to accelerate non-critical tasks, while keeping all **decision-making and architecture** as human-owned work.

## Development Philosophy

**Where I Used AI to Save Time:**
- Scaffolding React components (structure, boilerplate, styles)
- Debugging data parsing edge cases (null handling, type coercion)
- Drafting documentation (README sections, setup instructions)
- Iterating on code style and formatting

**Where I Owned the Entire Decision:**
- **Product Design**: Feature scope, what data to show, why it matters
- **Queue Prioritization Logic**: Mathematical formula to rank unanswered reviews
- **Data Architecture**: Filtering logic, state management, data flow
- **AI Guardrails**: Rate limiting, multi-provider fallback, output validation
- **System Decisions**: Technology choices (React, Vite, Tailwind, Papa Parse)

---

## 1. React Component Scaffolding

### Use Case
Generating initial component structure for PortfolioOverview, PropertyTable, ChatPanel, etc.

### Prompt Template
```
Create a React component that displays [feature].
The component receives:
- [prop1]: [type]
- [prop2]: [type]

Requirements:
- Dark theme (bg-zinc-900, etc.)
- Responsive layout
- [specific constraints]

Use Tailwind CSS.
```

### What I Changed
- Removed unnecessary features (charts, animations)
- Enforced consistent spacing and typography scales
- Added icons from Lucide React for visual hierarchy
- **Decision**: Focused on fast perception, not beauty—property managers need data clarity first

**Outcome:** ~60% faster component bootstrapping. Still required significant refactoring for production.

---

## 2. Debugging Data Parsing

### The Bug
CSV contained:
- `review_date: "2024-03-15"` (ISO string)
- `review_date: null` (Papa Parse returns empty string)
- `rating_overall: ""` (missing data)

Dates weren't being parsed. Nulls were becoming `"null"` strings.

### Solution (reviewParsers.js)
```javascript
review_date: new Date(r.review_date),
rating_overall: r.rating_overall != null ? Number(r.rating_overall) : null,
```

### What I Did (Human Decision)
- Applied the pattern consistently across all numeric fields
- Added validation in the parser to filter out invalid rows (>20% missing data = skip)
- Tested with the synthetic CSV to catch edge cases early
- Wrote comprehensive error logging for debugging

**Outcome:** AI helped with syntax; I owned the validation architecture.

---

## 3. Queue Prioritization Logic

### The Requirement
Property managers need to respond to:
1. Low-star reviews first (more damaging)
2. Recent reviews second (time-sensitive)
3. Highest impact on response rate

### My Formula (No AI)
```javascript
// Priority score: (5 - rating) * 100 + cappedDays
// Examples:
// - 1★ review, 180 days old: (5-1)*100 + 30 = 430
// - 2★ review, 2 days old: (5-2)*100 + 2 = 302
// - 5★ review, today: (5-5)*100 + 0 = 0

const priorityScore = (5 - rating) * 100 + Math.min(daysSinceReview, 30);
```

**Why 100x multiplier?** Ensures a 1★ review always outranks a 5★, even if very old.  
**Why cap days at 30?** Prevents ancient 1★ reviews from drowning out slightly older 2★ reviews.

**Decision Point:** I intentionally did NOT ask AI to generate this logic. This is product-critical—I needed to understand it completely and be able to defend it.

---

## 4. Documentation & Copy

### Process
- AI drafted initial installation instructions and data structure sections
- I rewrote all technical decisions and business logic sections
- I added all cost analysis, limitations.

### What AI Was Good For
- Phrasing setup instructions clearly
- Formatting environment variable tables
- Writing boilerplate sections

### What I Owned
- All decisions about architecture and costs
- All known issues and limitations
- Product philosophy sections
- Scaling recommendations

**Outcome:** Documentation ~40% faster to draft, but ~60% of content was rewritten by me.

---

## Key Takeaways

### Pattern 1: AI for Scaffolding, Not Decisions
```
AI is good for:          I own:
- Component structure    - Feature decisions
- Boilerplate code      - Algorithmic logic
- Code formatting       - Product strategy
- Documentation draft   - Validation rules
```

### Pattern 2: Always Review & Adapt
- AI-generated code requires 30-50% refactoring
- Never accept the first output
- Test immediately with real data
- Add constraints and guardrails in code

### Pattern 3: Keep Humans in the Loop for Critical Work
The queue prioritization logic, data validation strategy, and system architecture were all human-owned. AI helped with syntax and scaffolding, but never touched the core decisions.

### Pattern 4: Document Decisions, Not Just Code
This file is as important as the code. Future developers need to know *why* decisions were made, not just *what* the code does.

---

## What I Would Do Differently

1. **Test AI outputs earlier** — Run feature tests before considering scaffolding complete
2. **Batch component generation** — Create 5-10 components at once, spot inconsistencies, fix patterns
3. **Document assumptions** — Be explicit about what the AI assumed about the design system
4. **Measure time savings** — Track how much time AI actually saved vs. refactoring overhead

---

**Last Updated**: 2026-05-25  
**AI Models Used During Development**: Copilot (Microsoft - GitHub) used from Agents section in VSCode and Gemini (Google) used from API key, LLM integration.
**Development Duration**: ~7 hours, including deployment 
**AI Percentage**: ~30-40% (scaffolding, debugging, drafting)
