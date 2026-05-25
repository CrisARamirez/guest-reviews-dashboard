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

* Make sure there's at least one API key in `.env`
* Check the console for provider-specific errors
* Try switching providers manually

## AI in the Product

### Where AI is Used

The **Ask Reviews** chat panel uses large language models to analyze guest sentiment, identify recurring complaints, and provide actionable insights about property performance. The AI is **not** used for:
- Making automated decisions (e.g., blocking bad reviews)
- Generating host responses (drafts only, for human review)
- Filtering or removing data
- Replacing human judgment in queue management

### AI Guardrails & Limitations

**Data Limiting:**
- Only the first 80 reviews are sent to the LLM due to free tier constraints (1M tokens/month)
- When you ask a question, only the most recent 80 reviews are analyzed
- Large portfolios (500+ reviews) may have incomplete insights
- Trend detection works well but complaint patterns may be underrepresented

**Multi-Provider Fallback:**
- If Google Gemini is unavailable, the system automatically tries Claude, then OpenAI, then OpenRouter
- If all providers fail, an error message is shown (no silent failures)

**Output Validation:**
- Theme extraction is capped at 60 themes per property to prevent runaway outputs
- All LLM responses are validated against expected schemas
- Malformed JSON is caught and logged without crashing

**Cost Management:**
- At current usage (free tier), you can run ~1,800 analyses per month
- For 50,000+ reviews, consider batching (5-10 reviews per analysis) or switching to a cheaper provider like OpenRouter

### Current Setup (Gemini Free Tier)

We're using Gemini 2.5 Flash on the free tier. The limits are:
- 60 requests per minute
- 1 million tokens per month
- Typical latency: 2-4 seconds per request

Each analysis consumes roughly 550 tokens (400 input + 150 output), so with 1M free tokens we can do around 1,800 analyses per month.

### Workarounds & Scaling

**For Incomplete Analysis:**
1. Filter reviews by date range or property before asking questions
2. Use the **Properties** view for property-specific analysis
3. Upgrade to a paid tier to analyze all reviews

**For 10,000–50,000 Reviews/Month:**
- **Batching**: Analyze reviews in batches of 5-10 instead of individually (reduces API calls by ~70%, cost: ~$450/month)
- **Caching**: Store theme extraction results for 7-14 days; re-request only for new reviews

**For 100,000+ Reviews/Month:**
- **Hybrid Approach**: Use local embeddings + rule-based classification for 80% of reviews, only call LLM for complex/ambiguous cases (cost: $200–400/month)
- **Alternative Providers**: OpenRouter with Mistral (~$600/month), Anthropic Claude (~$9,600/month), OpenAI (~$3,600/month)

Monitor token usage in Google Cloud Console—switch to paid tier when you hit 75% of the monthly free quota.

### See Also
For detailed development notes on AI prompts, iteration, and decision-making, see [PROMPTS.md](./PROMPTS.md).

---

## Known Issues & Future Improvements

### Parsing Edge Cases

- Reviews with line breaks in the text may not display correctly in the queue
- Very old CSV files (pre-2020) with inconsistent date formats may fail to parse
- Empty strings in numeric fields are converted to `null` (not 0)

### Performance with Large Datasets

- With 50,000+ reviews, the UI may lag when applying filters
- Consider splitting data by year or region into separate uploads
- The anomaly detection algorithm runs in real-time on filter changes

### Response Rate Metric

The system counts a review as "responded" if `host_response` contains any text. It doesn't validate:
- Whether the response was actually sent
- Whether the response was appropriate
- Responses sent after the review was archived

### Draft Response Generator

The code includes a `generateDraftResponse()` function (in `src/lib/agent.js`), but it's not exposed in the UI. To use it, you would need to:
1. Add a "Generate Response" button to the queue view
2. Implement an approval workflow
3. Add audit logging for compliance
4. Have legal review the liability implications

---

## License

Cristian Ramírez. All rights reserved.

## Contact

For support or questions, contact the Product team.

---

**Last updated**: 2026-05-25
