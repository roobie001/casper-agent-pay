import React, { useEffect, useState } from "react";
import { getClickInstance } from "../lib/csprclick";

type Props = {
  publicKey: string;
  setPublicKey: (key: string) => void;
};

export const WalletConnect: React.FC<Props> = ({ publicKey, setPublicKey }) => {
  const [isSdkReady, setIsSdkReady] = useState(false);
  const connected = Boolean(publicKey);

  // 1. SDK Loading Guard
  useEffect(() => {
    const interval = setInterval(() => {
      if ((window as any).csprclick) {
        setIsSdkReady(true);
        clearInterval(interval);
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // 2. Event Listeners for Session Management
  useEffect(() => {
    if (!isSdkReady) return;

    const click = getClickInstance();

    const updateAccount = () => {
      const account = click.getActiveAccount();
      setPublicKey(account?.public_key || "");
    };

    updateAccount();

    click.on("csprclick:signed_in", updateAccount);
    click.on("csprclick:switched_account", updateAccount);
    click.on("csprclick:signed_out", updateAccount);

    return () => {
      click.off("csprclick:signed_in", updateAccount);
      click.off("csprclick:switched_account", updateAccount);
      click.off("csprclick:signed_out", updateAccount);
    };
  }, [isSdkReady, setPublicKey]);

  async function handleConnect() {
    try {
      const click = getClickInstance();
      await click.connect("casper-wallet");
    } catch (err) {
      console.error("Failed to connect Casper Wallet", err);
      alert("Failed to connect Casper Wallet: " + String(err));
    }
  }

  function truncateKey(key: string) {
    if (!key) return "";
    if (key.length <= 12) return key;
    return `${key.slice(0, 6)}...${key.slice(-6)}`;
  }

  // 3. Render
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <div
          className={`h-2 w-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`}
        />
        <h3 className="text-lg font-semibold text-white">Wallet</h3>
      </div>

      <div className="space-y-3">
        {!isSdkReady ? (
          <div className="text-gray-500 text-sm">Loading Wallet SDK...</div>
        ) : (
          <button
            onClick={handleConnect}
            className="w-full rounded-lg bg-green-600/20 border border-green-600/30 hover:bg-green-600/30 px-4 py-2 text-sm font-medium text-green-400 transition"
          >
            {connected ? "✓ Connected" : "Connect Casper Wallet"}
          </button>
        )}
      </div>

      {connected && (
        <div className="rounded-lg bg-green-500/5 border border-green-500/20 p-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            Connected Address
          </p>
          <p className="font-mono text-sm text-green-400 break-all">
            {truncateKey(publicKey)}
          </p>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
