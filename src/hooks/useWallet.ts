"use client";

import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useWalletStore } from "@/store/walletStore";
import { freighterAdapter, isWrongNetwork, WalletError } from "@/lib/stellar/wallet";
import { NETWORK_PASSPHRASE } from "@/lib/stellar/config";
import { requestChallenge, verifyChallenge, getMe } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

/**
 * Owns the full "connect wallet → sign-in-with-Stellar" flow: request the
 * account from Freighter, sign the backend's expiring challenge message
 * (no password anywhere), exchange it for a session JWT, and keep
 * everything in `useWalletStore`. UI only ever needs `connect`/`disconnect`
 * plus the store's read state.
 */
export function useWallet() {
  const store = useWalletStore();
  const revalidated = useRef(false);

  const authenticate = useCallback(async (address: string) => {
    const challenge = await requestChallenge(address);
    const signed = await freighterAdapter.signMessage(challenge.payload, address);
    const { token, user } = await verifyChallenge({
      publicKey: address,
      nonce: challenge.nonce,
      signature: signed.signatureBase64,
    });
    useWalletStore.getState().setAuthenticated({ token, user });
    return token;
  }, []);

  const connect = useCallback(async () => {
    const state = useWalletStore.getState();
    state.setConnecting();
    try {
      const available = await freighterAdapter.isAvailable();
      if (!available) {
        throw new WalletError(
          "Freighter wallet extension was not detected. Install it from freighter.app and refresh the page.",
        );
      }

      const address = await freighterAdapter.connect();
      const networkPassphrase = await freighterAdapter.getNetworkPassphrase();

      state.setConnected({ address, networkPassphrase, walletId: freighterAdapter.id });

      if (isWrongNetwork(networkPassphrase)) {
        toast.warning("Wrong network", {
          description: `Freighter is set to a different network than this app (expects ${NETWORK_PASSPHRASE.split(" ")[0]}…). Switch networks in your wallet.`,
        });
      }

      await authenticate(address);
      toast.success("Wallet connected", { description: `Signed in as ${address.slice(0, 4)}…${address.slice(-4)}` });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to connect wallet.";
      state.setError(message);
      toast.error("Connection failed", { description: message });
      throw err;
    }
  }, [authenticate]);

  const disconnect = useCallback(() => {
    useWalletStore.getState().disconnect();
    toast.message("Wallet disconnected");
  }, []);

  const ensureAuthenticated = useCallback(async (): Promise<string> => {
    const state = useWalletStore.getState();
    if (state.authToken && state.address) return state.authToken;
    if (!state.address) throw new WalletError("Connect your wallet first.");
    return authenticate(state.address);
  }, [authenticate]);

  // On mount, verify a persisted session token is still valid; silently
  // clear it (without disconnecting the wallet address) if it has expired.
  useEffect(() => {
    if (revalidated.current) return;
    revalidated.current = true;
    const { authToken, address } = useWalletStore.getState();
    if (!authToken || !address) return;
    getMe(authToken).catch((err) => {
      if (err instanceof ApiError && err.isAuthError) {
        useWalletStore.setState({ authToken: null, user: null });
      }
    });
  }, []);

  return {
    ...store,
    connect,
    disconnect,
    ensureAuthenticated,
    isConnected: store.status === "connected" && !!store.address,
  };
}
