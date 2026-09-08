import { Networks } from "@stellar/stellar-sdk";

export type StellarNetworkName = "TESTNET" | "PUBLIC" | "FUTURENET";

function resolveNetworkName(): StellarNetworkName {
  const raw = (process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "TESTNET").trim().toUpperCase();
  if (raw === "PUBLIC" || raw === "MAINNET") return "PUBLIC";
  if (raw === "FUTURENET") return "FUTURENET";
  return "TESTNET";
}

export const STELLAR_NETWORK: StellarNetworkName = resolveNetworkName();

export const NETWORK_PASSPHRASE: string =
  process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE?.trim() ||
  (STELLAR_NETWORK === "PUBLIC"
    ? Networks.PUBLIC
    : STELLAR_NETWORK === "FUTURENET"
      ? Networks.FUTURENET
      : Networks.TESTNET);

export const HORIZON_URL =
  process.env.NEXT_PUBLIC_HORIZON_URL ??
  (STELLAR_NETWORK === "PUBLIC" ? "https://horizon.stellar.org" : "https://horizon-testnet.stellar.org");

export const SOROBAN_RPC_URL =
  process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ??
  (STELLAR_NETWORK === "PUBLIC" ? "https://soroban-rpc.stellar.org" : "https://soroban-testnet.stellar.org");

export const AVENIRFLOW_CONTRACT_ID = process.env.NEXT_PUBLIC_AVENIRFLOW_CONTRACT_ID ?? "";

export const STELLAR_EXPLORER_TX_URL = (hash: string): string =>
  `https://stellar.expert/explorer/${STELLAR_NETWORK === "PUBLIC" ? "public" : "testnet"}/tx/${hash}`;

export const STELLAR_EXPLORER_ACCOUNT_URL = (address: string): string =>
  `https://stellar.expert/explorer/${STELLAR_NETWORK === "PUBLIC" ? "public" : "testnet"}/account/${address}`;
