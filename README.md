# AvenirFlow — frontend

A production-quality dashboard for managing **Stellar token vesting schedules** and **continuous payment streams**, built for DAOs, grant programs, ecosystem funds, and contributor payouts.

Next.js (App Router) · React · TypeScript · Tailwind CSS · Stellar/Soroban.

This app is the frontend half of AvenirFlow: it talks to the [`avenirflow-backend`](../AvenirFlow-backend) API for data and transaction building, and to a Stellar wallet extension (Freighter) for signing. It never holds a private key.

---

## Contents

- [Architecture](#architecture)
- [Getting started](#getting-started)
- [Backend configuration](#backend-configuration)
- [Wallet integration](#wallet-integration)
- [Using the Stellar testnet](#using-the-stellar-testnet)
- [Project structure](#project-structure)
- [Production deployment](#production-deployment)

## Architecture

Every write action (create a vesting schedule, claim, cancel, create a stream, withdraw) follows the same three-step pipeline, split cleanly across three layers:

```
 ┌──────────────┐   1. build unsigned tx    ┌────────────────────┐
 │   Frontend   │ ───────────────────────▶ │  avenirflow-backend │
 │ (this repo)  │ ◀─────────────────────── │   (Fastify + DB)    │
 └──────┬───────┘   { xdr_unsigned, ... }   └──────────┬─────────┘
        │ 2. sign with wallet                          │ 4. submit to
        ▼                                               │    Soroban RPC
 ┌──────────────┐                                       ▼
 │   Freighter  │                            ┌────────────────────┐
 │   (wallet)   │                            │   Stellar network   │
 └──────┬───────┘                            └────────────────────┘
        │ 3. POST /transactions/:id/submit { signedXdr }
        ▼
   back to backend
```

1. The frontend asks the backend to **build** an operation (e.g. `POST /vesting-schedules`). The backend simulates it against Soroban and returns an unsigned XDR transaction.
2. The frontend asks the connected wallet to **sign** that XDR. The private key never leaves the wallet extension.
3. The frontend **submits** the signed XDR back to the backend (`POST /transactions/:id/submit`), which relays it to the network and tracks its confirmation status.
4. The UI polls the transaction until it reaches a terminal status (`success`/`failed`) and reflects it with toasts and refreshed data.

This means the frontend never builds Soroban contract invocations itself — see [`src/hooks/useTransactionFlow.ts`](src/hooks/useTransactionFlow.ts) for the shared implementation, reused by every mutation in [`src/hooks/useVesting.ts`](src/hooks/useVesting.ts) and [`src/hooks/useStreams.ts`](src/hooks/useStreams.ts).

Layers are kept separate on purpose:

| Layer | Location | Responsibility |
| --- | --- | --- |
| Blockchain | `src/lib/stellar/` | Wallet adapter (Freighter), network config, client-side mirrors of the contract's vesting/streaming math for live progress bars |
| API | `src/lib/api/` | Typed fetch client for the AvenirFlow backend; one module per resource |
| State | `src/store/`, `src/hooks/` | Zustand for wallet/session state, TanStack Query for server state and caching |
| UI | `src/components/` | `ui/` design-system primitives, `shared/` cross-feature pieces, `vesting/` `streams/` `transactions/` `dashboard/` feature components |

## Getting started

Requires Node.js 20+.

```bash
npm install
cp .env.example .env.local   # then fill in values, see below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll land on the Dashboard, which prompts you to connect a wallet.

Other scripts:

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # ESLint
```

## Backend configuration

Set `NEXT_PUBLIC_AVENIRFLOW_API_URL` to the base URL of a running `avenirflow-backend`, **including** its `/api/v1` prefix:

```bash
NEXT_PUBLIC_AVENIRFLOW_API_URL=http://localhost:4000/api/v1
```

To run the backend locally, see its own README — in short: `npm install`, configure Postgres and `STELLAR_NETWORK`/`SOROBAN_RPC_URL`/`AVENIRFLOW_CONTRACT_ID` in its `.env`, run migrations, then `npm run dev`. Its default `CORS_ORIGINS` already allows `http://localhost:3000`.

The frontend never talks to Postgres or Soroban RPC directly for writes — only the backend does. The API client (`src/lib/api/client.ts`) unwraps the backend's `{ data }` / `{ error }` response envelope into typed results or a thrown `ApiError`.

> **Note:** `GET /vesting-schedules` and `GET /streams` require a `beneficiary`/`sender` (or `recipient`/`sender`) filter — there's no unscoped list endpoint — and there is currently no paginated `GET /transactions` list. The dashboard and Transactions page aggregate recent transactions client-side from the vesting schedules and streams the connected wallet is party to (see `src/hooks/useTransactions.ts`). Swap in a dedicated backend endpoint there once one exists, without touching any UI.

## Wallet integration

The app integrates with **[Freighter](https://www.freighter.app)**, the most widely used Stellar browser extension wallet. All wallet code is isolated behind a small `WalletAdapter` interface in [`src/lib/stellar/wallet.ts`](src/lib/stellar/wallet.ts), so adding another wallet (Albedo, xBull, a WalletConnect-style bridge for Lobstr, …) means implementing that interface — nothing in the UI or state layer needs to change.

Authentication is **wallet-based, with no password anywhere** ("sign-in with Stellar"), matching the backend's SEP-10-style challenge:

1. Connect: the frontend requests the account address from Freighter (`requestAccess`).
2. Challenge: it asks the backend for a short-lived, single-use message (`POST /auth/challenge`).
3. Sign: it asks Freighter to sign that exact message (`signMessage`) — never a transaction, just a message, so there's no fee and no on-chain footprint just to log in.
4. Verify: it posts the signature back (`POST /auth/verify`) and receives a session JWT, attached as `Authorization: Bearer <token>` to authenticated requests from then on.

See [`src/hooks/useWallet.ts`](src/hooks/useWallet.ts) for the full flow and [`src/store/walletStore.ts`](src/store/walletStore.ts) for the persisted session state (address + JWT, restored across reloads; silently cleared if expired).

Install Freighter from [freighter.app](https://www.freighter.app), create/import an account, and switch it to the same network as this app's `NEXT_PUBLIC_STELLAR_NETWORK`.

## Using the Stellar testnet

The default configuration targets **Testnet**:

```bash
NEXT_PUBLIC_STELLAR_NETWORK=TESTNET
```

To try the app end-to-end on testnet:

1. In Freighter, switch the network to **Test Net** and create/import an account.
2. Fund it via [Friendbot](https://laboratory.stellar.org/#account-creator?network=test) (or `https://friendbot.stellar.org/?addr=<YOUR_ADDRESS>`).
3. Configure a token contract for the forms. The built-in default in [`src/lib/constants.ts`](src/lib/constants.ts) includes the native XLM Stellar Asset Contract and a placeholder testnet USDC entry — replace these with the token(s) your `avenirflow-backend` / contract deployment actually supports, either by editing `CONFIGURED_TOKENS` or via `NEXT_PUBLIC_TOKENS` (a JSON array of `{ contractId, code, name, decimals }`).
4. Point `NEXT_PUBLIC_AVENIRFLOW_API_URL` at a backend that's itself configured for testnet (`STELLAR_NETWORK=TESTNET`, `SOROBAN_RPC_URL=https://soroban-testnet.stellar.org`, and the testnet `AVENIRFLOW_CONTRACT_ID`).
5. Connect your wallet in the app, create a vesting schedule or stream, and approve the signature prompts from Freighter.

Switching to `PUBLIC` (mainnet) later is a matter of changing `NEXT_PUBLIC_STELLAR_NETWORK` (and the corresponding backend config) — nothing in the frontend is hardcoded to testnet.

## Project structure

```
src/
  app/                    Routes (App Router): dashboard, vesting, streams, transactions, settings
  components/
    ui/                   Design-system primitives (Button, Card, Dialog, ProgressBar, ...)
    shared/                Cross-feature pieces (StatusBadge, AddressPill, TokenAmount, RequireWallet, ...)
    layout/                Sidebar, Topbar, AppShell
    wallet/                WalletButton (connect / account menu)
    dashboard/ vesting/ streams/ transactions/   Feature-specific components
  hooks/                  TanStack Query hooks per resource + useWallet + useTransactionFlow
  lib/
    api/                  Typed fetch client (client.ts) + one module per backend resource
    stellar/              Wallet adapter, network config, client-side vesting/streaming math
    validation/           Zod schemas for the create-vesting / create-stream forms
    types.ts              Domain types mirroring the backend's row shapes
    constants.ts           Nav items, token registry
  store/                  Zustand: wallet/session state
  providers/              React Query + theme providers
```

## Production deployment

This is a standard Next.js app — deploy it anywhere Next.js runs (Vercel, a Docker image behind any Node host, etc.).

1. Set the environment variables from `.env.example` for the target environment (`NEXT_PUBLIC_AVENIRFLOW_API_URL` pointing at your deployed backend, `NEXT_PUBLIC_STELLAR_NETWORK=PUBLIC` for mainnet, and your production token registry).
2. `npm run build && npm run start`, or deploy the repo to your platform of choice with those build/start commands.
3. Make sure the backend's `CORS_ORIGINS` includes this app's production URL.
4. Because every `NEXT_PUBLIC_*` variable is bundled into client JS, set them at **build time** for the environment you're building for — a single build isn't meant to be reused across networks with different env vars injected at runtime.
5. No server-side secrets are required by this app — it holds no private keys and no API secret; all sensitive operations happen in the wallet extension and the backend.
