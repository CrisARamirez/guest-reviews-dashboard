# Guest Reviews Dashboard

An advanced analytics platform designed to manage and optimize guest reviews across real estate portfolios. A BI system that combines data analytics, anomaly detection, and AI-powered assistance to maximize the digital reputation of properties.

## Overview

**Guest Reviews Dashboard** is a monolithic web application built with React and Vite that enables property managers to:

* **Analyze review trends**
* **Automatically detect anomalies** in properties with negative performance trends
* **Manage unanswered review queues** to improve response rates
* **Query multiple AI providers** for insights about trends, recurring complaints, and guest sentiment
* **Filter and segment** data by city, channel, language, rating, and date range

## Business Rules

### Review Lifecycle

* **Statuses**: Responded / Unanswered
* **Sources**: Multiple distribution channels (booking platforms, social media, etc.)
* **Languages**: English, Spanish, and Portuguese support
* **Ratings**: 1–5 star scale

### Property Analysis

* **Anomalies**: A property is marked as "trending down" if its 7–14 day trend is significantly negative
* **Statistics**: Average ratings, response rate (%), total reviews by period
* **Portfolio context**: Comparison between properties within the same portfolio

### Response Management

* **Prioritization**: Queue sorted by unanswered review relevance and urgency
* **Impact**: Response rate correlates with the quality of future reviews
* **Goal**: Maintain a response rate above 90%

### AI Queries

* **Enriched context**: The assistant receives portfolio metrics, filtered review samples, and conversation history
* **Use cases**:

  * Identify recurring complaints
  * Detect amenities causing dissatisfaction
  * Summarize negative sentiment
  * Analyze guest complaints vs. operational issues
* **Fallback providers**: If one AI provider fails, the system automatically attempts the next available provider

## Technical Stack

### Frontend

* **React 19.2.6** — UI library
* **Vite 8.0.12** — Build tool & development server
* **Tailwind CSS 4.3.0** — Utility-first CSS framework
* **Lucide React 1.16.0** — Icon library
* **Papa Parse 5.5.3** — CSV parser for data imports
* **Lodash 4.18.1** — Data transformation utilities

### Development Tools

* **ESLint 10.3.0** — Linting & code quality
* **Vite React Plugin 6.0.1** — Fast refresh during development
* **TypeScript types** — React and React DOM typings

### AI Integration (Multi-Provider)

* **Google Gemini** — via `VITE_GEMINI_API_KEY`
* **Anthropic Claude** — via `VITE_ANTHROPIC_API_KEY`
* **OpenAI GPT** — via `VITE_OPENAI_API_KEY`
* **OpenRouter** — via `VITE_OPENROUTER_API_KEY` (universal LLM router)

**Fallback Architecture**: Providers are attempted in sequence. If one fails, the system automatically falls back to the next available provider.

## Data Architecture

```txt id="c2v8rn"
CSV Input (guest_reviews.csv)
    ↓
App.jsx (State Management)
    ├── parseReviews() → Data normalization
    ├── applyFilters() → Dynamic filtering
    ├── getPropertyStats() → Metrics calculation
    └── getUnansweredQueue() → Response prioritization
    ↓
View Components:
    ├── PortfolioOverview → Aggregated dashboard
    ├── PropertyTable → Property analytics table
    ├── PropertyDetail → Details modal
    ├── UnansweredQueue → Queue management
    └── ChatPanel → AI-powered queries
```

## Installation

### Prerequisites

* Node.js 16+
* npm or yarn

### Steps

```bash id="u7x4pl"
# Clone repository
git clone <repository-url>
cd guest-reviews-dashboard

# Install dependencies
npm install

# Create .env file (see .env.example)
cp .env.example .env

# Configure API keys inside .env
# At least one of:
# VITE_GEMINI_API_KEY
# VITE_ANTHROPIC_API_KEY
# VITE_OPENAI_API_KEY
# VITE_OPENROUTER_API_KEY
```

## Development

### Local Development Server

```bash id="p4m9zw"
npm run dev
```

Access the app at:

```txt id="f3n8ld"
http://localhost:5173
```

(default Vite port)

### Production Build

```bash id="k5r2yt"
npm run build
```

Build artifacts are generated in `dist/`.

### Preview Production Build

```bash id="e1v6mq"
npm run preview
```

### Linting

```bash id="r8w2cx"
npm run lint
```

## Data Structure

### CSV Input (`guest_reviews.csv`)

```txt id="h2q7np"
property_id, property_name, city, channel, language, rating, response_status,
review_text, review_date, host_response, response_date
```

### Internally Processed Fields

* `isAnomaly` — Automatic anomaly detection flag
* `anomalyTrend` — Percentage change
* `daysAgo` — Relative calculation from today
* `isTrendingDown` — Property-level aggregated flag

## Environment Variables

```env id="m6c1vs"
# Gemini API (Google)
VITE_GEMINI_API_KEY=your_gemini_api_key

# Claude API (Anthropic)
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key

# OpenAI API
VITE_OPENAI_API_KEY=your_openai_api_key

# OpenRouter API (Universal Router)
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
```

**Note**: At least one API key must be configured. The system is resilient and automatically attempts multiple providers.

## Main Views

### 1. **Overview** (Dashboard)

* Portfolio KPIs: total reviews, average rating, response rate
* Property metrics table
* Active anomaly indicators
* Trend visualizations

### 2. **Properties** (Analytics Table)

* Sortable tabular view of all properties
* Columns: property name, city, rating, reviews, response rate, status
* Click to open detailed property modal

### 3. **Unanswered** (Management Queue)

* Prioritized list of unanswered reviews
* Filterable by property, channel, and rating
* Direct integration with response management workflows

### 4. **Ask Reviews** (AI Chat)

* Conversational portfolio assistant
* Trend, complaint, and sentiment analysis
* Multi-provider AI with automatic fallback
* Enriched context with portfolio metrics and filtered reviews

## Core Algorithms

### Anomaly Detection

```javascript id="n3k7yb"
isAnomaly = (
  last 7–14 day trend < negative threshold
  AND enough reviews exist for validation
)
```

### Response Rate

```javascript id="x4q9mt"
responseRate = (responded_reviews / total_reviews) * 100
```

### Queue Prioritization

```txt id="z8p5wr"
Sort by:
1. Lower ratings first (negative reviews first)
2. Most recent reviews first
3. Importance (complaints > neutral > positive)
```

## Debugging

### Development

* Open DevTools (F12)
* Check Console for parsing logs and AI errors
* Inspect Network requests for API latency

### CSV Parse Errors

If `loading` never disappears, verify:

* Correct path: `/public/guest_reviews.csv`
* Valid CSV format (headers, UTF-8 encoding)
* Required columns are present

### AI Errors

* Ensure at least one API key exists in `.env`
* Check Console for provider-specific errors
* Try switching providers manually

## License

Cristian Ramírez. All rights reserved.

## Contact

For support or questions, contact the Product team.

---

**Last updated**: 2026-05-24
