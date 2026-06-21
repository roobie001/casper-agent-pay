# CasperAgent Pay

> Autonomous AI payment agent on Casper Network

CasperAgent Pay lets users execute CSPR transactions using plain English instructions. Powered by Groq LLaMA for intent parsing, casper-js-sdk v5 for transaction building, and CSPR.click for secure wallet signing on Casper Network.

## Demo

[Demo Video](https://youtu.be/zLZqY_iiu2I) | [Live App](https://casper-agent-pay.vercel.app/)

## What It Does

Users type natural language payment instructions and the AI agent autonomously:

- Parses the intent (balance check, transfer, conditional transfer)
- Evaluates any conditions against real wallet state
- Builds and signs the transaction via the connected Casper Wallet
- Executes it live on Casper testnet
- Logs every decision with tx hash and timestamp

### Example Instructions

- `check my balance` → queries real CSPR balance via live RPC
- `transfer 50 CSPR to 0202...` → builds, signs (via CSPR.click), and broadcasts a real transfer
- `pay only if my balance is above 100 CSPR` → conditional payment, evaluated against live balance

## Tech Stack

| Layer            | Technology                               |
| ---------------- | ---------------------------------------- |
| Frontend         | React + TypeScript + Vite + Tailwind CSS |
| AI Agent         | Groq LLaMA 3.1 8B Instant                |
| Blockchain       | casper-js-sdk v5 + Casper Testnet        |
| Wallet & Signing | CSPR.click (Casper Wallet provider)      |
| Backend          | Node.js + Express (RPC + AI proxy)       |
| Deploy           | Vercel                                   |

## Architecture

User Input → Groq LLaMA (parse intent) → AgentInstruction

AgentInstruction → casper-js-sdk (build Deploy) → CSPR.click (sign via wallet)

Signed Deploy → Casper Testnet RPC → TransactionRecord

TransactionRecord → UI (logged with deploy hash, linked to explorer)

## Getting Started

```bash
# Clone the repo
git clone https://github.com/roobie001/casper-agent-pay
cd casper-agent-pay

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Add your GROQ_API_KEY to .env

# Run dev server + proxy
npm run dev
```

You'll also need the [Casper Wallet browser extension](https://www.casperwallet.io/) installed and funded with testnet CSPR (via Discord faucet) to test real transfers.

## Environment Variables

```env
VITE_CASPER_RPC=http://localhost:3001/rpc
VITE_CASPER_NETWORK=casper-test
GROQ_API_KEY=your_groq_api_key
```

## Wallet Integration Notes

Transfers are signed using [CSPR.click](https://docs.cspr.click/), Casper's officially recommended wallet integration SDK. This replaced an earlier direct `window.CasperWalletProvider` approach, which hit a documented incompatibility between casper-js-sdk v5's `TransactionV1` builder and the wallet extension's legacy Deploy-based signing — CSPR.click bridges this gap correctly.

## Hackathon

Built for the **Casper Agentic Buildathon 2026** — $150,000 prize pool.

Tags: Agentic AI · DeFi · Real-World Assets · Casper Network · x402

## Builder

**Cajetan Obiajulu** — Final year CS student at UNN, building at the intersection of AI and Web3.

GitHub: [@roobie001](https://github.com/roobie001)
