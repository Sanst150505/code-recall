# CodeRecall 🧠

> **Spaced-Repetition & Skill Retention Engine for LeetCode**  
> Turn historical problem-solving activity into an actionable, prioritized daily revision queue.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=flat&logo=postgresql)](https://neon.tech/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

---

## 📌 The Problem

Most DSA trackers focus on quantity:
> *"You solved 300 problems! 🎉"*

What they don't tell you:
- You haven't practiced **Backtracking** or **Dynamic Programming** in 95 days.
- You struggled repeatedly on **Topological Sort** with multiple Time Limit Exceeded (TLE) verdicts.
- When an interview comes up in two weeks, the algorithmic patterns have faded due to the **Ebbinghaus Forgetting Curve**.

**CodeRecall** answers the question that actually matters:
> **"What should I revise today, and why?"**

---

## ✨ Key Capabilities

- **Priority Revision Queue**: Scored and ranked across 88 DSA topics based on decay urgency, exposure depth, and past struggle.
- **Three Practical Signals**:
  1. **Concept Decay (45%)**: Rolling window decay tracking (30D / 90D / 180D / 365D since last solve).
  2. **Exposure Deficit (35%)**: Depth of historical mastery vs. total topic exposure.
  3. **Attempt Friction (20%)**: Struggle ratio calculated from historical failed verdicts (Wrong Answer, TLE, Runtime Errors).
- **Verified Recall Loop**: Pick a target problem from a decaying topic, solve it on LeetCode, and verify your live `Accepted` verdict to reset your retention schedule.
- **Companion Chrome Extension (Manifest V3)**: 1-click sync pulling complete historical submissions directly from your active browser session without passwords or manual CSV exports.
- **Incremental Sync Engine**: Checkpointed ingestion with duplicate skipping to handle hundreds of submissions safely.
- **Clean Information Architecture**: Focused executive metrics and segmented revision queues designed to prevent dashboard overwhelm.

---

## 🏗️ Architecture & Data Pipeline

```
┌─────────────────────────────────┐
│     LeetCode Official Web       │
│  (Active Session in Browser)    │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│  CodeRecall Chrome Extension    │ ◄── Manifest V3 background service worker
│     (Client-side Extractor)     │     Paginates submissions & streams batches
└────────────────┬────────────────┘
                 │ POST /api/submissions/import
                 ▼
┌─────────────────────────────────┐
│       Next.js API Routes        │ ◄── Ingestion & verification endpoints
│   (/api/submissions/import)     │     Fast problem catalog enrichment
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│    Neon PostgreSQL Database     │ ◄── Users, Problems, Submissions,
│          (via Prisma)           │     SyncCheckpoints, RevisionRecords
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│    Analytics Engine (lib/)      │ ◄── Computes rolling exposure windows,
│ (analytics-service.ts)          │     friction ratios & priority scores
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│      Dashboard UI (React 19)    │ ◄── Home Pulse, Priority Revision Queue,
│  (Next.js Server + Client View) │     Competency Matrix & Submission History
└─────────────────────────────────┘
```

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Server Components)
- **Frontend**: React 19, TypeScript, Tailwind CSS, Recharts
- **Database & ORM**: PostgreSQL (Neon Serverless), Prisma ORM
- **Browser Extension**: Chrome Manifest V3 (Vanilla JS, Chrome Storage & Cookies API)
- **APIs**: LeetCode GraphQL API

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18.17+ or v20+)
- PostgreSQL database (or free [Neon Serverless Postgres](https://neon.tech))

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/Sanst150505/code-recall.git
cd code-recall
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set your database connection string in `.env`:

```env
DATABASE_URL="postgresql://user:password@host/neondb?sslmode=require"
```

### 3. Initialize Database & Seed Demo Data

Run Prisma migrations and seed the 9-month synthetic demo journey:

```bash
npx prisma db push
npm run db:seed:demo
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.  
To view the interactive demo immediately, visit:  
[http://localhost:3000/dashboard?user=demo](http://localhost:3000/dashboard?user=demo)

---

## 🧩 Chrome Extension Setup

The companion extension enables 1-click continuous synchronization of your LeetCode submission history:

1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** (toggle in top right).
3. Click **Load unpacked** and select the [`extension/`](./extension) folder from this repository.
4. Make sure you are signed into your account on [leetcode.com](https://leetcode.com).
5. Click the **CodeRecall** icon in your Chrome toolbar, verify your username, and click **Sync Submissions**.
6. Your dashboard will open automatically with your personalized retention queue.

---

## 📂 Project Structure

```
code-recall/
├── app/
│   ├── api/
│   │   ├── analytics/        # Historical analytics computation endpoint
│   │   ├── leetcode/sync/    # Quick sync fallback endpoint
│   │   ├── revision/log/     # Reassessment outcomes & decay reset
│   │   ├── revision/verify/  # Live LeetCode solve verification
│   │   ├── submissions/      # Paginated submission query endpoint
│   │   ├── submissions/import/# Chrome extension batch ingestion
│   │   └── sync/status/      # Sync checkpoint & volume stats
│   ├── dashboard/
│   │   ├── page.tsx          # Home pulse & top focus directive
│   │   ├── revision/         # Revise Today queue & live solve verification
│   │   ├── topics/           # Competency matrix & DSA coverage
│   │   ├── history/          # Paginated submission records
│   │   └── sync/             # Extension setup & sync status center
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ActiveUserSession.tsx # Client session restoration across tabs
│   ├── Charts.tsx            # Difficulty donut, timeline area, & topic bars
│   ├── Header.tsx            # Navigation header & quick sync trigger
│   ├── RevisionCard.tsx      # Priority revision card with live solve drawer
│   ├── RevisionQueueView.tsx # Filterable, searchable revision queue tabs
│   ├── Sidebar.tsx           # Global responsive navigation
│   ├── SubmissionHistoryTable.tsx # Paginated history table with filters
│   └── TopicsTable.tsx       # DSA category table with sorting & search
├── extension/                # Chrome Extension (Manifest V3)
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.js
│   └── background.js
├── lib/
│   ├── analytics-service.ts  # Spaced repetition heuristic calculations
│   ├── leetcode.ts           # GraphQL queries for LeetCode public API
│   ├── prisma.ts             # Prisma client instance with adapter
│   └── sync-service.ts       # Synchronization dispatcher & gap detector
├── prisma/
│   └── schema.prisma         # Database schema (User, Problem, Submission, etc.)
├── scripts/
│   ├── seed-demo.ts          # Realistic 9-month synthetic DSA journey
│   ├── inspect-analytics.ts  # CLI database inspection tool
│   ├── test-analytics.ts     # Heuristic scoring engine test
│   └── test-sync-pipeline.ts # Sync pipeline integration test
└── package.json
```

---

## 🧪 Available Scripts

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts local Next.js development server |
| `npm run build` | Generates Prisma client and runs production build |
| `npm run lint` | Runs ESLint checks |
| `npm run db:seed:demo` | Seeds 9-month demo account with balanced revision categories |
| `npm run db:inspect` | CLI tool to inspect topic counts and submission volume in DB |
| `npm run test:analytics` | Tests spaced-repetition decay, friction, and priority scoring |
| `npm run test:sync` | Tests incremental synchronization and boundary checkpoints |

---

## 🔒 Security & Privacy

- **Zero Credentials Stored**: The application never requests or stores LeetCode passwords. Authentication occurs strictly in the user's browser via the extension.
- **Sanitized Exports**: Submission payloads only contain problem identifiers, language, runtimes, memory, and verdicts. Source code is not stored.
- **Scoped Ingestion**: Submissions are tied to the verified username detected by the extension.
- **Environment Isolation**: Production connection strings and sensitive variables are managed strictly server-side.

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
