# CodeRecall

CodeRecall helps developers retain the problem-solving patterns, approaches, and concepts they learn while practicing DSA. It analyzes historical LeetCode activity to surface decaying concepts and recommend targeted reinforcement.

---

## Screenshots

![Dashboard Overview](screenshots/dashboard.png)

| Revision Queue | Progress Analytics |
| :---: | :---: |
| ![Revision Queue](screenshots/revise-today.png) | ![Progress Analytics](screenshots/progress.png) |

| Topic Competency Matrix | Live Solve Verification |
| :---: | :---: |
| ![Topic Competency Matrix](screenshots/topic-matrix.png) | ![Live Solve Verification](screenshots/solve-verification.png) |

---

## Overview

Most coding dashboards focus on raw milestones like total problems solved, but they overlook the natural decay of algorithmic recall over time. Solving a dynamic programming problem three months ago does not guarantee you can reproduce the pattern under interview conditions today.

CodeRecall connects to your historical LeetCode submissions to estimate revision priorities across 88 DSA topics. By tracking practice recency, submission failure rates, and category coverage depth, it converts past activity into an actionable queue showing which topics to revise next and why.

---

## Key Features

- Topic-level prioritization: Ranks algorithmic concepts by urgency across 88 supported categories.
- Practice and struggle analysis: Evaluates practice recency, problem exposure depth, and repeated submission friction.
- Chrome extension sync: Extracts complete submission history directly from an active browser session with one click.
- Incremental checkpointing: Safely ingests submissions with boundary tracking and duplicate skipping.
- Verification loop: Recommends curated practice problems and verifies live Accepted solutions against LeetCode to refresh topic schedules.

---

## How Prioritization Works

CodeRecall balances three weighted signals to score and schedule topics:

- Concept Decay: Evaluates elapsed time since your last solve across rolling 30, 90, 180, and 365-day windows to model pattern fading.
- Volume Deficit: Flags topics where you have limited overall exposure (1–3 solves) and suggests 3–5 foundational problems plus related topics.
- Attempt Friction: Identifies struggle patterns based on your historical attempts-per-solve ratio and repeated failures (Wrong Answer, Time Limit Exceeded, Runtime Errors).

---

## Tech Stack

- Frontend: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Recharts
- Backend & Database: PostgreSQL (Neon Serverless), Prisma ORM
- Browser Extension: Chrome Manifest V3 (Storage and Cookie APIs)
- Data Source: LeetCode GraphQL public endpoints

---

## Getting Started

### Prerequisites

- Node.js 20.9.0+ (Node.js 22 recommended)
- PostgreSQL database (local or hosted via [Neon](https://neon.tech))

### Installation

1. Clone the repository and install dependencies:

```bash
git clone https://github.com/Sanst150505/code-recall.git
cd code-recall
npm install
```

2. Configure environment variables in `.env`:

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://username:password@ep-host.neon.tech/neondb?sslmode=require"
```

3. Push the database schema and seed the 9-month demo history:

```bash
npx prisma db push
npm run db:seed:demo
```

4. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000/dashboard?user=demo](http://localhost:3000/dashboard?user=demo) to explore the interactive demo profile.

---

## Chrome Extension Setup

The companion extension syncs submission history from your authenticated browser session without requiring credentials or password entry.

1. Open `chrome://extensions/` in Google Chrome and enable **Developer mode**.
2. Click **Load unpacked** and select the [`extension/`](./extension) folder.
3. Sign into [leetcode.com](https://leetcode.com), open the CodeRecall extension popup, and click **Sync Submissions**.
4. The extension streams submission batches to your local instance and opens your dashboard automatically upon completion.

---

## Future Scope

Planned improvements under consideration:

- Adaptive revision scheduling: Integrating algorithmic spaced repetition models (such as FSRS or SM-2) beyond current heuristic weights.
- Longitudinal recall tracking: Tracking retention stability and decay velocity across consecutive revision intervals.
- Granular pattern recommendations: Recommending practice problems tailored to specific algorithmic sub-patterns rather than broad topic categories.

---

## License

Distributed under the [MIT License](LICENSE).
