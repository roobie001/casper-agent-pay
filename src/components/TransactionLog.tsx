import React from "react";
import type { TransactionRecord } from "../lib/types";

type Props = {
  transactions: TransactionRecord[];
  currentAccount: string;
};

function getActionLabel(instruction: string): string {
  const lower = instruction.toLowerCase();
  if (lower.includes("if") && lower.includes("balance")) {
    return "Conditional transfer";
  }
  if (lower.includes("transfer") || lower.includes("send")) return "Transfer";
  if (lower.includes("check") || lower.includes("balance")) return "Balance check";
  return "Agent action";
}

function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
}

function truncateHash(value: string, end = 4): string {
  if (!value || value.length <= 12) return value;
  return `${value.slice(0, 6)}...${value.slice(-end)}`;
}

function formatInstruction(instruction: string): string {
  return instruction.replace(/\b[0-9a-fA-F]{64,68}\b/g, (key) =>
    truncateHash(key),
  );
}

export const TransactionLog: React.FC<Props> = ({
  transactions,
  currentAccount,
}) => {
  const filteredTransactions = transactions.filter((tx) => {
    if (!tx.accountKey) return true;

    return tx.accountKey === currentAccount;
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col text-white">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-white">Transaction log</h3>
        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/45">
          {filteredTransactions.length}
        </span>
      </div>

      <div
        className="min-h-[360px] flex-1 overflow-y-auto pr-1"
        style={{ maxHeight: "calc(100vh - 300px)" }}
      >
        {filteredTransactions.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed border-white/10 bg-white/[0.02] text-center">
            <div className="mb-3 h-9 w-9 rounded-full border border-red-400/25 bg-red-500/10" />
            <p className="text-sm font-medium text-white/45">
              No transactions yet
            </p>
          </div>
        ) : (
          filteredTransactions.map((record) => (
            <div
              key={record.id}
              className="transition hover:bg-white/[0.045]"
              style={{
                border: "0.5px solid rgba(255,255,255,0.07)",
                borderRadius: "10px",
                marginBottom: "8px",
                padding: "12px 14px",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-[11px] text-white/35">
                    {getActionLabel(record.instruction)}
                  </p>
                  <p className="truncate text-xs text-white">
                    {formatInstruction(record.instruction)}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                    record.status === "executed"
                      ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-400"
                      : "border-red-500/30 bg-red-500/15 text-red-400"
                  }`}
                >
                  {record.status === "executed" ? "Executed" : "Rejected"}
                </span>
              </div>

              {record.decision && (
                <div className="mt-2 text-xs font-medium text-red-300">
                  {record.decision}
                </div>
              )}

              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-white/35">
                <span>{formatTimestamp(record.timestamp)}</span>
                {record.txHash && (
                  <a
                    href={`https://testnet.cspr.live/deploy/${record.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-red-300 transition hover:text-red-200 hover:underline"
                  >
                    {truncateHash(record.txHash)}
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionLog;
