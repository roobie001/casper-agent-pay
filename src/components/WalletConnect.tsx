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
