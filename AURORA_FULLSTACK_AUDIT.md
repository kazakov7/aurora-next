# AURORA — Condensed Full-Stack Audit

**Audit:** October 2026; latest verified update: Phase 4, October 10, 2026.  
**Backend:** `/Users/dadakhonovich/Desktop/AURORA` — NestJS 11, GraphQL, Mongoose/MongoDB, Socket.IO, Stripe.  
**Frontend:** `/Users/dadakhonovich/Desktop/aurora-next` — Next.js 14 (Pages Router), React 18, Apollo Client, SCSS.

> **Reading rule:** Phase 1–4 remediation results supersede the original audit findings below. A problem reported in the initial baseline may already have been fixed. No changes were committed or pushed during Phase 4.

## 1. Executive verdict

AURORA's core full-stack architecture and API integration are functional. However, **real-money production launch remains BLOCKED** by payment/payout policy and reconciliation, production infrastructure, incomplete automated frontend coverage, and several unverified flows. The original baseline grades (Backend 7.5/10, Frontend 7.0/10, Integration 8.5/10, Security 5.0/10, DB 6.5/10, UI 7.0/10, DevOps 4.0/10) describe the **pre-remediation state**, not a fresh Phase 4 rescore.

## 2. Confirmed fixes — Phases 1–4

| Phase                          | Verified changes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1 — Auth & CORS**            | JWT access checks current ACTIVE, non-deleted member and current role in MongoDB; revoked/blocked users lose GraphQL and Socket.IO access. Auth failures now use appropriate unauthorized responses and avoid login account enumeration. HTTP and Socket.IO share `CORS_ALLOWED_ORIGINS`; production needs the actual allowed origins configured.                                                                                                                                                                                                                   |
| **2 — Pagination**             | Standard GraphQL page/limit inputs require integers, `page >= 1`, and `1 <= limit <= 100`; ranking queries retain `1..20`. Invalid values return `BAD_REQUEST`; cursor messages limit remains 100.                                                                                                                                                                                                                                                                                                                                                                  |
| **3 — Booking/Payment**        | Tour seat reservation + Booking creation now share a MongoDB transaction; competing Property bookings are serialized by `availabilityVersion`. Idempotency keys are checked for member/booking/amount context. **Only signature-verified Stripe webhooks** with matching server-side amount/currency confirm payments; duplicates, stale events, cancellation, expiry and seat release are conditionally guarded.                                                                                                                                                   |
| **4 — Session/Uploads/Search** | `useAuthSession` now uses authenticated `VerifyMemberSession` rather than public `getMember`; handles token refresh, race conditions and auth errors. Socket reconnect reads current token. Upload target allowlist prevents path traversal; extension derives from MIME. User-entered regex text is escaped across search services.                                                                                                                                                                                                                                |
| **4 — Pages/UI**               | Global Search API integration kept and keyboard behavior fixed. Agent hotel/tour create/edit modals now call actual GraphQL APIs. Mobile domain CSS restored for `#mobile-wrap`, with responsive layouts. Fake hotel ratings, badges, addresses, map links, cancellation promises, destination imagery and admin placeholder fields were replaced/removed. Checkout now handles signed-out users, invalid dates and displays server-calculated payment totals. SCSS moved into proper partials; favicon, upload accept types and several missing images were fixed. |
| **4 — Telegram**               | OAuth authorization-code + PKCE flow added to sign-in/up and callback. Backend detects HTTP 200 token error bodies correctly. Invalid code, expired state, cancellation, and PKCE were exercised; real login still requires allowed redirect URLs in BotFather (potential HTTPS tunnel for localhost).                                                                                                                                                                                                                                                              |

Other Phase 4 improvements: Global Search 300 ms debounce and 2-character minimum; `getChatSocketUrl()` reuse; centralized auth error handling excluding login/signup exchanges; correct GraphQL upload `target`; travel-history fields; booking cancellation UI shown only when `PENDING`; navigation/auth/agent listing display fixes; non-functional hotel filters removed and city/type/amenity filters aligned to real data.

## 3. Latest verification (Phase 4)

| Check                                    | Result                                                                                                                          |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Frontend TypeScript                      | **PASS**                                                                                                                        |
| Next.js production build                 | **PASS — 33/33 pages**                                                                                                          |
| GraphQL documents against live schema    | **PASS — 108/108**                                                                                                              |
| Backend TypeScript + Nest build          | **PASS**                                                                                                                        |
| Backend unit tests                       | **PASS — 27/27 (5 suites)**                                                                                                     |
| Backend E2E                              | **68/69**; one unchanged mismatch: Tour creation defaults to `ACTIVE`, while `catalog-social.e2e-spec.ts:169` expects `PENDING` |
| Browser desktop                          | **PASS**; anonymous 17 routes, logged-in USER 17 routes, no page/GraphQL errors; Google OAuth origin still needs configuration  |
| Mobile browser                           | **PASS** at 390 px viewport on 17 routes; does not establish full device/browser coverage                                       |
| Global Search, Socket.IO, session checks | **PASS** in exercised scenarios                                                                                                 |
| Stripe checkout                          | **Test mode** PaymentIntent initialized; no actual confirmation or charge tested                                                |
| ESLint                                   | **BLOCKED**: frontend config absent; `next lint` prompts for setup                                                              |

Earlier phase results: security E2E 6/6; pagination-focused 12/12; booking-focused 15/15. Initial audit's 21 unit tests and earlier TypeScript issues are historical, superseded by the latest results above.

## 4. Remaining production blockers and risks

**Critical — before accepting real payments**

1. **Payouts:** Stripe Connect / destination charges, agent onboarding, direct agent settlement, commission and payout reconciliation are **not implemented**; funds currently settle to the platform Stripe account.
2. **Refund policy:** Confirmed bookings cannot currently be cancelled/refunded through the implemented state machine. Define deadlines, eligibility, partial refunds, disputes and inventory recovery before showing cancellation/refund promises.
3. **Payment reconciliation:** No durable Stripe webhook event ledger or reconciliation worker; a crash between Stripe PaymentIntent creation and local DB insert can orphan an intent. Add replay/recovery, monitoring and alerting for failed refunds.
4. **Worker ownership:** 60-second booking-expiry/travel-history timers run inside each process. State guards protect correctness, but replicas repeat scans. Move to a dedicated scheduler with lease/ownership and observability.
5. **Currency consistency:** Phase 4 observed a Tour stored as `USD 450000`, causing a prospective **USD 450,000** Stripe charge in test mode. Backend currently accepts input currency; report proposes enforcing **KRW** server-side and migrating inconsistent records. **Confirm the intended business currency before applying any migration**; the report's KRW policy may not reflect later product decisions.
6. **Production environment:** Configure allowed CORS origins and secret management; rotate exposed credentials; preserve MongoDB transaction-capable deployment. Uploaded images currently use local disk (`uploads`), unsuitable for stateless/multi-instance production; migrate to S3/R2 or equivalent persistent object storage. Health checks and monitoring remain needed.

**Functionality / quality to verify or finish**

- Agent create/edit hotel/tour modals were contract-checked but **not runtime-tested** with approved HOTEL and TOUR agents. Test uploads, validations and reserved-seat limits.
- Admin pages were not runtime-tested with ADMIN credentials.
- Google Sign-In 403: authorize `http://localhost:3000` as a JavaScript origin; Telegram: register callback URLs in BotFather.
- Tour publish policy is unresolved: immediate `ACTIVE` creation versus moderation `PENDING` (and the failing E2E assertion).
- Legacy data: inconsistent amenity spellings (`WiFi`/`WIFI` etc.); destination property/tour counters not updated consistently; external Stitch images can expire.
- Agent My Hotels/Tours search/type filters need backend support or must remain disabled. Phone signup links to missing `/account/phone-signup` (404): implement or hide.
- Frontend lacks automated component/e2e tests and ESLint setup. Reduce unnecessary Apollo `network-only` fetches, improve protected-route transitions and standardize z-index/SCSS.
- Original audit also identified potentially unused GraphQL endpoints: `getHello`, `getMyRating`, `submitRating`, `getMySupportTickets`; verify usage before deletion. `telegramAuth` was initially listed unused but **became integrated in Phase 4**.

## 5. Booking and payment behavior

- **Booking:** `PENDING -> CONFIRMED` only after a valid on-time webhook; `PENDING -> CANCELLED` for eligible cancel/expiry/failure; `CONFIRMED -> COMPLETED` via travel-history processing after stay checkout / tour end. `CANCELLED` and `COMPLETED` are terminal. `CONFIRMED -> CANCELLED/REFUNDED` is not implemented.
- **Payment:** `PENDING -> SUCCEEDED` on verified Stripe success; invalid captured payment may transition to `REFUNDED`; late failure cannot downgrade terminal success/refund. Refund requests use deterministic Stripe idempotency keys.
- Payment and booking integrity received 15/15 targeted E2E tests and MongoDB transaction verification. Production-grade reconciliation is still outstanding.

## 6. Additional historical observations

Original architecture audit: modular NestJS design and typed GraphQL are strong; the frontend uses Apollo/SCSS and a 1300 px design standard. Initial findings included unnecessary `network-only` fetches, weak SSR route gating, CSS stacking conflicts, unindexed querying, local uploads, and no frontend automated tests. Several original security, booking-concurrency, pagination, false UI content and mobile findings have since been **fixed** as documented in Section 2; do **not** reopen them as unfixed solely based on the original findings table.

During Phase 4 a **historical environment incident** was recorded: around 04:05 KST, the then-connected development `AURORA` DB was observed emptied while Compass/backend activities overlapped. The audit attributed no cause to Phase 4 tests and did not establish a root cause. The information reflects that moment, **not necessarily the current database contents**. The temporary Stripe test PaymentIntent remained unconfirmed.

## 7. Priority action plan

1. **Immediately:** protect DB/Stripe secrets, verify current database/backups and environment mapping, set production CORS origins and OAuth callback allowlists; resolve the currency policy and audit listing amounts.
2. **Before go-live:** implement payout/Stripe Connect approach, refund policy, durable event reconciliation, worker ownership, asset storage and operational monitoring/health checks.
3. **Verify core roles:** authenticated ADMIN and approved HOTEL/TOUR agent end-to-end flows; fix Tour status policy and the sole failing E2E case.
4. **Finish data/UI integrity:** destination counters, amenity normalization, expired images, agent filters, phone signup and protected-route polish.
5. **Quality/performance:** add frontend ESLint + automated smoke/component tests, optimize Apollo cache and review indexes, pagination and z-index scale.

**Bottom line:** AURORA has working core functionality and substantial verified fixes, but an unrestricted production launch—particularly real-money bookings—should wait for the above operational, payout and policy requirements.
