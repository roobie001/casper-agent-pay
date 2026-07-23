import React from "react";

type Props = {
  publicKey: string;
  setPublicKey: (key: string) => void;
};

export const WalletConnect: React.FC<Props> = ({ publicKey, setPublicKey }) => {
  const connected = Boolean(publicKey);

  async function handleConnect() {
    try {
      const CasperWalletProvider = (window as any).CasperWalletProvider;
      if (!CasperWalletProvider) {
        alert("Please install Casper Wallet from casperwallet.io");
        return;
      }
      const provider = CasperWalletProvider();
      await provider.requestConnection();
      let key = "";
      let attempts = 0;
      while (!key && attempts < 10) {
        await new Promise((r) => setTimeout(r, 500));
        try {
          key = await provider.getActivePublicKey();
        } catch {}
        attempts++;
      }
      if (!key) throw new Error("Could not get public key");
      setPublicKey(key);
    } catch (err) {
      alert("Failed to connect: " + String(err));
    }
  }

  function truncateKey(key: string) {
    if (!key) return "";
    if (key.length <= 12) return key;
    return `${key.slice(0, 6)}...${key.slice(-6)}`;
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleConnect}
        disabled={connected}
        className={`w-full rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
          connected
            ? "cursor-default border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
            : "border-red-600/30 bg-red-600/15 text-red-300 hover:bg-red-600/25"
        }`}
      >
        {connected ? "✓ Connected" : "Connect Casper Wallet"}
      </button>

      {connected && (
        <button
          type="button"
          onClick={() => setPublicKey("")}
          className="cursor-pointer border-0 bg-transparent p-0 text-[11px] text-red-500/70 transition hover:text-red-400"
        >
          Disconnect
        </button>
      )}

      {connected && (
        <div className="rounded-lg border border-red-600/20 bg-red-600/[0.08] px-2.5 py-2">
          <p className="mb-1 text-[10px] uppercase text-white/30">
            Connected
          </p>
          <p className="break-all font-mono text-[11px] text-red-300">
            {truncateKey(publicKey)}
          </p>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
