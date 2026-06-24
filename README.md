# The Pundit - World Cup 2026 AI Agent with Walrus Memory

**The Pundit** is an opinionated, dramatic, and savage AI football analyst designed for the FIFA World Cup 2026. Built as a submission for the Walrus Memory Hackathon, it demonstrates persistent, on-chain memory by tracking your predictions, opinions, and interactions, and referencing them in future sessions to critique or praise your football insights.

---

## 🌟 Key Features

1. **Walrus Memory Integration**: All user interactions and predictions are persisted on **Walrus Mainnet** via the `@mysten-incubation/memwal` SDK.
2. **Dynamic system prompt expansion**: Relies on dual recall (semantic interaction context + structured prediction history) fetched from Walrus Memory and fed to the LLM system prompt.
3. **Structured Prediction Extraction**: Every chat message is automatically analyzed to detect explicit football predictions. These are extracted as structured JSON and recorded on-chain.
4. **Prediction Ledger**: A beautifully designed user interface displaying a list of all your recorded predictions (team, stage, confidence, date, quote) synced live from Walrus.
5. **The Roast**: The Pundit forensically analyzes your on-chain prediction history and generates a personalized, savage roast of your football predictions.
6. **Per-User Memory Isolation**: Uses a dynamic namespace strategy (`world-cup-2026-pundit-{userId}`) using client-side persistent IDs sent in headers to guarantee that users see only their own memories, predictions, and custom roasts.
7. **Premium Design System**: Dark-themed, neon-accented glassmorphic user interface using vanilla CSS, premium typography, micro-animations, and responsive grids.

---

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Vanilla CSS with custom properties, glassmorphic paneling, and glowing elements
- **AI Integration**: Vercel AI SDK (`ai`), `@ai-sdk/google` (Gemini 2.5 Flash)
- **Memory Store**: Walrus Memory (Mainnet endpoint: `https://relayer.memory.walrus.xyz`)

---

## 🚀 Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/EmirIsKing/the-pundit.git
cd the-pundit
```

### 2. Install dependencies
*Note: Due to Zod version mismatches in the early `@mysten-incubation/memwal` package, install with `--legacy-peer-deps`.*
```bash
npm install --legacy-peer-deps
```

### 3. Configure environment variables
Create a `.env` file in the root of the project with the following configuration:
```env
# Gemini API Configuration
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here

# Walrus Memory Configuration
MEMWAL_DELEGATE_KEY=your_walrus_delegate_private_key_here
MEMWAL_ACCOUNT_ID=your_walrus_account_address_here
MEMWAL_SERVER_URL=https://relayer.memory.walrus.xyz
```

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📐 Architecture & How Memory Works

The application employs a double-pass AI flow to ensure memories are recorded both contextually and structurally:

```
[ User Sends Message ]
        │
        ├──► 1. Recall from Walrus Memory (queries recent messages + predictions list)
        ├──► 2. Stream response from Gemini using retrieved context as system prompt
        │
        └──► 3. onFinish Event (runs in background):
                 ├──► Save raw chat interaction to Walrus
                 └──► Extract structured JSON prediction (via Gemini) -> Save prediction to Walrus
```

### Namespace Isolation
To prevent users from seeing each other's predictions, each client generates a unique `pundit_user_id` inside `localStorage` on their first visit. This ID is passed to the Next.js API routes in the `x-user-id` header. The backend then constructs a dynamic, isolated namespace:
```typescript
const namespace = `world-cup-2026-pundit-${userId}`;
```
All on-chain writes and queries are isolated to this specific namespace.

---

## 🧪 Verification & Build

To ensure production stability, run:
```bash
npm run build
```
This generates a static build with dynamic server endpoints for all APIs, confirming TypeScript safety and bundle completeness.
