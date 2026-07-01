import React from "react";

type Props = {
  publicKey: string;
  setPublicKey: (k: string) => void;
  secretKey: string;
  setSecretKey: (k: string) => void;
};

export const WalletPanel: React.FC<Props> = ({
  publicKey,
  setPublicKey,
  secretKey,
  setSecretKey,
}) => {
  const bothFilled = Boolean(publicKey && secretKey);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`h-2 w-2 rounded-full ${bothFilled ? "bg-green-500" : "bg-red-500"}`}
        />
        <h3 className="text-lg font-semibold text-white">Wallet</h3>
      </div>

      <div className="space-y-2">
        <label className="block text-xs text-gray-400">Public Key</label>
        <input
          type="text"
          placeholder="G... your Stellar public key"
          value={publicKey}
          onChange={(e) => setPublicKey(e.target.value)}
          className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white"
        />

        <label className="block text-xs text-gray-400">Secret Key</label>
        <input
          type="password"
          placeholder="S... your Stellar secret key"
          value={secretKey}
          onChange={(e) => setSecretKey(e.target.value)}
          className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white"
        />

        <p className="text-xs text-yellow-300">
          ⚠ Testnet only. Never paste real mainnet keys.
        </p>
      </div>
    </div>
  );
};

export default WalletPanel;
