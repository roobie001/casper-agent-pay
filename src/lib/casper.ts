import {
  HttpHandler,
  RpcClient,
  PurseIdentifier,
  PublicKey,
  Deploy,
  DeployHeader,
  ExecutableDeployItem,
  TransferDeployItem,
} from "casper-js-sdk";

const RPC_URL = import.meta.env.DEV ? "http://localhost:3001/rpc" : "/api/rpc";

export async function getBalance(publicKeyHex: string): Promise<string> {
  if (!publicKeyHex || publicKeyHex.length < 10) {
    throw new Error("Invalid public key");
  }
  const rpcHandler = new HttpHandler(RPC_URL);
  const rpcClient = new RpcClient(rpcHandler);
  const pubKey = PublicKey.fromHex(publicKeyHex);
  const balance = await rpcClient.queryLatestBalance(
    PurseIdentifier.fromPublicKey(pubKey),
  );
  const motes = balance.balance;
  const cspr = Number(motes) / 1_000_000_000;
  return `${cspr.toLocaleString()} CSPR`;
}

export async function sendTransfer({
  from,
  to,
  amount,
}: {
  from: string;
  to: string;
  amount: number;
  privateKeyPem?: string;
}): Promise<string> {
  // Fix 1: Bypass ESLint 'any' rule locally for the window object checking
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CasperWalletProvider = (window as any).CasperWalletProvider;
  if (!CasperWalletProvider) throw new Error("Casper Wallet not installed");
  const provider = CasperWalletProvider();

  const senderKey = PublicKey.fromHex(from);
  const recipientKey = PublicKey.fromHex(to);

  // 1. Create the transfer session
  const session = new ExecutableDeployItem();
  session.transfer = TransferDeployItem.newTransfer(
    String(Math.floor(amount * 1_000_000_000)), // amount in motes
    recipientKey,
    undefined,
    Date.now(), // memo/transfer ID
  );

  // 2. Initialize the default header
  const deployHeader = DeployHeader.default();
  deployHeader.account = senderKey;
  deployHeader.chainName = "casper-test";

  // 3. Assemble the Deploy (0.1 CSPR standard payment fee)
  const payment = ExecutableDeployItem.standardPayment("100000000");
  const deploy = Deploy.makeDeploy(deployHeader, payment, session);
  const deployJson = Deploy.toJSON(deploy);

  // 4. Request signature from Casper Wallet
  const signResult = await provider.sign(JSON.stringify(deployJson), from);
  if (signResult.cancelled) throw new Error("Transaction cancelled by user");

  // 5. Dynamically prefix the signature based on key type (01 for Ed25519, 02 for Secp256k1)
  const algorithmPrefix = from.substring(0, 2);
  const prefixedSignature = algorithmPrefix + signResult.signatureHex;

  // Fix 2: Cast deployJson as Record<string, any> to satisfy TS object-spreading
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deployJsonObj = deployJson as Record<string, any>;

  // 6. Reconstruct the signed deploy with the correctly prefixed signature
  const signedDeploy = Deploy.fromJSON({
    ...deployJsonObj,
    approvals: [{ signer: from, signature: prefixedSignature }],
  });

  // 7. Push deploy to the node
  const rpcHandler = new HttpHandler(RPC_URL);
  const rpcClient = new RpcClient(rpcHandler);
  const result = await rpcClient.putDeploy(signedDeploy);

  // Fix 3: Call .toHex() to safely extract the raw string representation of the Hash
  return result.deployHash.toHex();
}

export default { getBalance, sendTransfer };
