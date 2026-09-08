/**
 * Stellar wallet integration.
 *
 * Freighter (https://www.freighter.app) is the primary supported wallet —
 * it's the most widely used Stellar browser extension and its API covers
 * everything AvenirFlow needs: address discovery, network detection,
 * message signing (for wallet-based login) and transaction signing (for
 * submitting vesting/streaming operations).
 *
 * The rest of the app never imports `@stellar/freighter-api` directly; it
 * goes through this module, which keeps the door open to adding another
 * wallet (Albedo, xBull, Lobstr via WalletConnect, …) behind the same
 * `WalletAdapter` shape without touching UI or state-management code.
 */
import freighter from "@stellar/freighter-api";
import { NETWORK_PASSPHRASE, STELLAR_NETWORK } from "./config";

export class WalletError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WalletError";
  }
}

export interface SignedMessage {
  signatureBase64: string;
  signerAddress: string;
}

export interface WalletAdapter {
  id: string;
  label: string;
  isAvailable(): Promise<boolean>;
  connect(): Promise<string>;
  getAddress(): Promise<string | null>;
  getNetworkPassphrase(): Promise<string>;
  signTransaction(xdr: string): Promise<string>;
  signMessage(payload: string, address: string): Promise<SignedMessage>;
}

function toBase64(value: string | Buffer): string {
  if (typeof value === "string") return value;
  return value.toString("base64");
}

export const freighterAdapter: WalletAdapter = {
  id: "freighter",
  label: "Freighter",

  async isAvailable() {
    if (typeof window === "undefined") return false;
    try {
      const { isConnected, error } = await freighter.isConnected();
      return !error && typeof isConnected === "boolean";
    } catch {
      return false;
    }
  },

  async connect() {
    const { address, error } = await freighter.requestAccess();
    if (error || !address) {
      throw new WalletError(error?.message ?? "Freighter did not grant access to an account.");
    }
    return address;
  },

  async getAddress() {
    const { address, error } = await freighter.getAddress();
    if (error || !address) return null;
    return address;
  },

  async getNetworkPassphrase() {
    const { networkPassphrase, error } = await freighter.getNetwork();
    if (error || !networkPassphrase) return NETWORK_PASSPHRASE;
    return networkPassphrase;
  },

  async signTransaction(xdr: string) {
    const { signedTxXdr, error } = await freighter.signTransaction(xdr, {
      networkPassphrase: NETWORK_PASSPHRASE,
    });
    if (error || !signedTxXdr) {
      throw new WalletError(error?.message ?? "The wallet rejected the transaction signing request.");
    }
    return signedTxXdr;
  },

  async signMessage(payload: string, address: string) {
    const res = await freighter.signMessage(payload, {
      networkPassphrase: NETWORK_PASSPHRASE,
      address,
    });
    if (res.error || !res.signedMessage) {
      throw new WalletError(res.error?.message ?? "The wallet rejected the message signing request.");
    }
    return { signatureBase64: toBase64(res.signedMessage), signerAddress: res.signerAddress };
  },
};

export const WALLET_ADAPTERS: WalletAdapter[] = [freighterAdapter];

export function getWalletAdapter(id: string): WalletAdapter {
  const adapter = WALLET_ADAPTERS.find((a) => a.id === id);
  if (!adapter) throw new WalletError(`Unknown wallet adapter '${id}'.`);
  return adapter;
}

/** True when the connected wallet's active network doesn't match this deployment's target network. */
export function isWrongNetwork(walletPassphrase: string | null): boolean {
  if (!walletPassphrase) return false;
  return walletPassphrase !== NETWORK_PASSPHRASE;
}

export const FREIGHTER_INSTALL_URL = "https://www.freighter.app/";
export const EXPECTED_NETWORK_LABEL = STELLAR_NETWORK;
