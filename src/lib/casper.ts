import {
  HttpHandler,
  RpcClient,
  PurseIdentifier,
  Deploy,
  DeployHeader,
  ExecutableDeployItem,
  TransferDeployItem,
  PublicKey,
} from "casper-js-sdk";

import { getClickInstance } from "./csprclick";

// const RPC_URL = "http://localhost:3001/rpc";
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
  const senderKey = PublicKey.fromHex(from);
  const recipientKey = PublicKey.fromHex(to);

  const transferAmountMotes = String(Math.floor(amount * 1_000_000_000));

  const session = new ExecutableDeployItem();
  session.transfer = TransferDeployItem.newTransfer(
    transferAmountMotes,
    recipientKey,
    undefined,
    Date.now(),
  );

  const deployHeader = DeployHeader.default();
  deployHeader.account = senderKey;
  deployHeader.chainName = "casper-test";

  const payment = ExecutableDeployItem.standardPayment("100000000");

  const deploy = Deploy.makeDeploy(deployHeader, payment, session);

  const deployJson = Deploy.toJSON(deploy);
  const click = getClickInstance();

  const result = await click.send(deployJson, from, false);

  if (result?.cancelled) {
    throw new Error("Transaction cancelled by user");
  }
  if (result?.error) {
    throw new Error(result.error);
  }

  return result?.deployHash || result?.transactionHash || "unknown";
}

export default { getBalance, sendTransfer };
