import React, { useState } from "react";

type Props = {
  isProcessing: boolean;
  onSubmit: (input: string) => void;
};

export const AgentChat: React.FC<Props> = ({ isProcessing, onSubmit }) => {
  const [input, setInput] = useState("");

  const prompts = [
    "check my balance",
    "transfer 50 CSPR to...",
    "pay only if balance > 100",
  ];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    onSubmit(input.trim());
    setInput("");
  }

  function handlePromptClick(prompt: string) {
    setInput(prompt);
  }

  return (
    <div className="text-white">
      <p className="mb-3 text-xs text-white/45">What do you want to do?</p>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handlePromptClick(prompt)}
            className="rounded-full border border-red-600/30 bg-red-600/15 px-3 py-1 text-xs font-medium text-red-200 transition hover:bg-red-600/25"
          >
            {prompt}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. transfer 10 CSPR to 0202..."
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-[13px] text-white outline-none transition placeholder:text-white/25 focus:border-red-400/40 focus:ring-1 focus:ring-red-400/15 disabled:opacity-50"
          disabled={isProcessing}
        />

        <button
          type="submit"
          disabled={isProcessing}
          className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-5 py-2.5 text-[13px] font-medium text-white transition hover:from-red-500 hover:to-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isProcessing ? "⟳ Processing..." : "✦ Execute"}
        </button>
      </form>
    </div>
  );
};

export default AgentChat;
