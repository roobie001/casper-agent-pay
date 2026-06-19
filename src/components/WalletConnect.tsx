import React, { useEffect } from "react";
import { getClickInstance } from "../lib/csprclick";

type Props = {
  publicKey: string;
  setPublicKey: (key: string) => void;
};

export const WalletConnect: React.FC<Props> = ({ publicKey, setPublicKey }) => {
  const connected = Boolean(publicKey);

  // Initialize and check for existing session on mount
  useEffect(() => {
    const click = getClickInstance();

    const updateAccount = () => {
      const account = click.getActiveAccount();
      if (account?.public_key) {
        setPublicKey(account.public_key);
      }
    };

    // Check immediately if already connected
    updateAccount();

    // Listen for CSPR.click events
    click.on("csprclick:signed_in", updateAccount);
    click.on("csprclick:switched_account", updateAccount);
    click.on("csprclick:signed_out", () => setPublicKey(""));

    return () => {
      click.off("csprclick:signed_in", updateAccount);
      click.off("csprclick:switched_account", updateAccount);
      click.off("csprclick:signed_out", () => setPublicKey(""));
    };
  }, [setPublicKey]);

  async function handleConnect() {
    try {
      const click = getClickInstance();
      // Trigger the connection UI
      await click.connect("casper-wallet");
      // The event listeners added in useEffect will handle setting the public key
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <div
          className={`h-2 w-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`}
        />
        <h3 className="text-lg font-semibold text-white">Wallet</h3>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleConnect}
          className="w-full rounded-lg bg-green-600/20 border border-green-600/30 hover:bg-green-600/30 px-4 py-2 text-sm font-medium text-green-400 transition"
        >
          {connected ? "✓ Connected" : "Connect Casper Wallet"}
        </button>
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
