import { apiRequest } from "./client";
import type { AuthUser } from "../types";

export interface AuthChallenge {
  nonce: string;
  payload: string;
  expiresAt: string;
}

export function requestChallenge(publicKey: string): Promise<AuthChallenge> {
  return apiRequest<AuthChallenge>("/auth/challenge", { method: "POST", body: { publicKey } });
}

export function verifyChallenge(params: {
  publicKey: string;
  nonce: string;
  signature: string;
}): Promise<{ token: string; user: AuthUser }> {
  return apiRequest<{ token: string; user: AuthUser }>("/auth/verify", { method: "POST", body: params });
}

export function getMe(token: string): Promise<AuthUser> {
  return apiRequest<AuthUser>("/auth/me", { token });
}
