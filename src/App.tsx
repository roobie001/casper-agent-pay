import { useEffect, useState } from "react";
import AgentChat from "./components/AgentChat";
import WalletConnect from "./components/WalletConnect";
import TransactionLog from "./components/TransactionLog";
import { parseInstruction, executeInstruction } from "./lib/agent";
import { getBalance } from "./lib/casper";
import type { TransactionRecord } from "./lib/types";

function truncateKey(key: string) {
  if (!key) return "";
  if (key.length <= 14) return key;
  return `${key.slice(0, 6)}...${key.slice(-6)}`;
}

function App() {
  const [publicKey, setPublicKey] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [balance, setBalance] = useState("");
  const [balanceError, setBalanceError] = useState("");
  const [showBalance, setShowBalance] = useState(false);

  const [transactions, setTransactions] = useState<TransactionRecord[]>(() => {
    const saved = localStorage.getItem("casper_transactions");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("casper_transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    let active = true;
    setShowBalance(false);
    setBalance("");
    setBalanceError("");

    if (!publicKey) return;

    getBalance(publicKey)
      .then((value) => {
        if (!active) return;
        setBalance(value.replace(/\s*CSPR$/i, ""));
      })
      .catch(() => {
        if (!active) return;
        setBalanceError("Account not found");
      });

    return () => {
      active = false;
    };
  }, [publicKey]);

  async function handleAgentSubmit(input: string) {
    setIsProcessing(true);
    try {
      const instruction = await parseInstruction(input);
      const result = await executeInstruction(instruction, publicKey);
      setTransactions((prev) => [
        { ...result, accountKey: publicKey },
        ...prev,
      ]);
    } catch (error) {
      const rejectedRecord: TransactionRecord = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        instruction: input,
        status: "rejected",
        decision: error instanceof Error ? error.message : String(error),
        accountKey: publicKey,
      };
      setTransactions((prev) => [rejectedRecord, ...prev]);
    } finally {
      setIsProcessing(false);
    }
  }

  const connected = Boolean(publicKey);

  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      <div className="fixed inset-x-0 top-0 z-50 h-[3px] animate-[shimmer_3s_linear_infinite] bg-[linear-gradient(90deg,#dc2626,#ef4444,#dc2626)] bg-[length:200%_100%]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(rgba(220,38,38,0.1)_1px,transparent_1px)] bg-[length:28px_28px]" />

      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="flex w-full flex-col gap-3 border-b border-white/[0.08] p-4 pb-4 lg:w-[220px] lg:border-b-0 lg:border-r">
          <div>
            <p className="mb-1 text-[11px] uppercase tracking-[0.08em] text-white/30">
              Wallet
            </p>
            <WalletConnect publicKey={publicKey} setPublicKey={setPublicKey} />
          </div>

          {connected && (
            <div className="rounded-[10px] border border-red-600/25 bg-red-600/[0.12] px-3 py-2.5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-[11px] uppercase tracking-[0.08em] text-white/35">
                  CSPR Balance
                </p>
                <button
                  type="button"
                  onClick={() => setShowBalance((value) => !value)}
                  className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/45 transition hover:text-white"
                  aria-label={showBalance ? "Hide balance" : "Show balance"}
                >
                  {showBalance ? "🙈" : "👁"}
                </button>
              </div>

              {balanceError ? (
                <p className="text-[11px] text-white/45">{balanceError}</p>
              ) : showBalance ? (
                <p className="text-xl font-medium text-red-400">
                  {balance || "Loading"}
                  {balance && (
                    <span className="ml-1 text-xs font-normal text-white/35">
                      CSPR
                    </span>
                  )}
                </p>
              ) : (
                <span className="text-base tracking-[3px] text-white/30">
                  ••••••
                </span>
              )}
            </div>
          )}

          <div className="mt-auto pt-4" style={{ marginTop: "auto" }}>
            <p className="mb-1 text-[11px] uppercase tracking-[0.08em] text-white/30">
              Network
            </p>
            <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2">
              <div className="flex items-center gap-2 text-xs text-white/55">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Online</span>
              </div>
              <p className="mt-1 text-[11px] text-white/30">Horizon: casper-test</p>
            </div>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex flex-col gap-4 border-b border-white/[0.08] px-7 pb-4 pt-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="mb-1 text-[11px] uppercase tracking-[0.12em] text-white/35">
                Payment Agent
              </p>
              <h1 className="text-[26px] font-medium leading-tight">
                <span className="text-white">Casper</span>
                <span className="text-red-300">Agent</span>
                <span className="text-white"> Pay</span>
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <p className="text-sm text-white/45">
                  Autonomous AI payment agent on Casper Network
                </p>
                <span className="rounded-full border border-red-600/30 bg-red-600/15 px-2 py-0.5 text-[11px] text-red-300">
                  Testnet
                </span>
              </div>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/55">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  connected ? "bg-emerald-400" : "bg-red-500"
                }`}
              />
              <span>{connected ? "Connected" : "Not connected"}</span>
              {connected && (
                <span className="font-mono text-red-300">
                  {truncateKey(publicKey)}
                </span>
              )}
            </div>
          </header>

          <div className="border-b border-white/[0.08] px-5 py-4">
            <AgentChat
              isProcessing={isProcessing}
              onSubmit={handleAgentSubmit}
            />
          </div>

          <div className="mt-1 flex min-h-0 flex-1 border-t border-white/[0.08] px-5 pb-4 pt-4">
            <TransactionLog
              transactions={transactions}
              currentAccount={publicKey}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;
