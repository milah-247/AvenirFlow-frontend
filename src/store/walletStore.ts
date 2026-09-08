import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@/lib/types";

export type WalletConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

interface WalletState {
  status: WalletConnectionStatus;
  address: string | null;
  walletId: string; // adapter id, e.g. "freighter"
  networkPassphrase: string | null;
  authToken: string | null;
  user: AuthUser | null;
  error: string | null;

  setConnecting: () => void;
  setConnected: (params: { address: string; networkPassphrase: string; walletId: string }) => void;
  setAuthenticated: (params: { token: string; user: AuthUser }) => void;
  setNetworkPassphrase: (passphrase: string) => void;
  setError: (message: string) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      status: "disconnected",
      address: null,
      walletId: "freighter",
      networkPassphrase: null,
      authToken: null,
      user: null,
      error: null,

      setConnecting: () => set({ status: "connecting", error: null }),

      setConnected: ({ address, networkPassphrase, walletId }) =>
        set({ status: "connected", address, networkPassphrase, walletId, error: null }),

      setAuthenticated: ({ token, user }) => set({ authToken: token, user }),

      setNetworkPassphrase: (passphrase) => set({ networkPassphrase: passphrase }),

      setError: (message) => set({ status: "error", error: message }),

      disconnect: () =>
        set({
          status: "disconnected",
          address: null,
          networkPassphrase: null,
          authToken: null,
          user: null,
          error: null,
        }),
    }),
    {
      name: "avenirflow-wallet",
      partialize: (state) => ({
        address: state.address,
        walletId: state.walletId,
        authToken: state.authToken,
        user: state.user,
      }),
    },
  ),
);
