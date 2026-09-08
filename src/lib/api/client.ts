/**
 * Thin fetch wrapper for the AvenirFlow backend (`avenirflow-backend`).
 *
 * The backend wraps every success response as `{ data: T }` and every error
 * as `{ error: { code, message, details? } }` (see
 * `avenirflow-backend/src/plugins/errorHandler.ts`) — this module unwraps
 * both into a typed result or a thrown `ApiError`, so nothing above this
 * layer has to think about the envelope.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_AVENIRFLOW_API_URL?.replace(/\/+$/, "") ?? "http://localhost:4000/api/v1";

export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  get isAuthError(): boolean {
    return this.statusCode === 401;
  }
}

interface Envelope<T> {
  data?: T;
  error?: { code: string; message: string; details?: unknown };
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  token?: string | null;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, query, token, signal } = opts;

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    throw new ApiError(
      0,
      "NETWORK_ERROR",
      err instanceof Error && err.name === "AbortError"
        ? "Request was cancelled."
        : `Could not reach the AvenirFlow API at ${API_BASE_URL}. Is the backend running?`,
    );
  }

  let json: Envelope<T> | undefined;
  try {
    json = res.status === 204 ? undefined : ((await res.json()) as Envelope<T>);
  } catch {
    json = undefined;
  }

  if (!res.ok) {
    const err = json?.error;
    throw new ApiError(
      res.status,
      err?.code ?? "UNKNOWN_ERROR",
      err?.message ?? `Request failed with status ${res.status}.`,
      err?.details,
    );
  }

  return (json?.data ?? (undefined as T)) as T;
}
