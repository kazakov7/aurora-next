# AURORA i18n migration — progress log

Source of truth for findings: `docs/i18n-final-audit.md`. This file records what has been done, phase by phase.

| | |
| --- | --- |
| Started | 2026-10-11 01:25 KST, branch `develop` |
| Checkpoint before migration | commit `ca56e00` |
| Scope agreed with the owner | Entire audit scope; admin panel last; About page skipped (it does not exist) |

## Baseline (Phase 0)

- `AGENTS.md` re-read. The audit's inventory was rebuilt by re-running its extractor on the current tree instead of trusting old line numbers.
- Baseline on the current tree: **2,019** hardcoded strings, 11 of 122 UI files using `useI18n`, 174 dictionary keys, `tsc --noEmit` clean.
- **Concurrent work in the same tree.** Another process is implementing the property availability calendar (`PropertyAvailabilityCalendar.tsx`, `PropertyReservationWidget.tsx`, `apollo/user/query.ts`, `property-detail.scss`, `availability.*` dictionary keys). Those four source files were left out of the checkpoint commit and are re-read before any edit. Dictionary files are always merged, never overwritten wholesale.
- **Dev server on :3000 is down, not because of this migration.** A production `next build` was run inside the repository at 01:27 and overwrote `.next` under the running dev server (every route returns 500, `Cannot find module './chunks/vendor-chunks/next.js'`). It needs `rm -rf .next` and a restart. All runtime checks below were made on an isolated copy of the app on another port.

## Phase 1 — i18n foundation ✅

Changed: `libs/i18n/index.tsx`, `libs/i18n/serverMessages.ts` (new), `middleware.ts` (new), `scripts/check-i18n.mjs`.

| Audit finding | Resolution |
| --- | --- |
| I-1 saved language applied only on the client | `middleware.ts` reads the `NEXT_LOCALE` cookie and redirects unprefixed full-page requests to `/ko/...` or `/uz/...` on the server. `localeDetection` stays `false`, so `Accept-Language` never redirects and `/` keeps serving English to visitors without a saved choice. |
| I-2 saved preference overrode explicit URLs | The client-side `localStorage` redirect was removed. `/ko/...` and `/uz/...` always win. |
| I-3 logout dropped the locale | Covered by the middleware: `/` is redirected server-side for a saved non-English language. |
| I-4 no plural support | `t(key, { count })` resolves `key_one` / `key_other` through `Intl.PluralRules`, falling back to `key`. |
| I-5 no translation outside components | `translateActive()`, `translateActiveError()` for alert helpers and Apollo links. |
| I-6 locale-blind dates and numbers | `formatDate`, `formatNumber`, `formatRelativeTime` on the hook (`en-US`, `ko-KR`, `uz-Latn-UZ`). |
| I-7 raw enum values | `tEnum(group, value)` with `enums.<group>.<VALUE>` → `enums.common.<VALUE>` → readable fallback. |
| I-9 backend messages shown verbatim | `tError(err, fallbackKey)` and `translateServerMessage()`: 113 API messages are mapped to `serverErrors.*`; unknown messages are still shown as received. |
| I-13 weak dictionary check | `npm run i18n:check` now also verifies placeholders, keys used in code but missing, and reports unused keys (`--unused` makes that fatal). Plural variants are compared by base key. |
| Interpolation printed `{{name}}` for missing values | A provided-but-empty value now renders as an empty string. |
| New: rich messages | `tx(key, nodes)` lets a placeholder be a React node (links, emphasised numbers) so word order can change per language. |

Limit found while testing: Next strips the default-locale prefix before middleware runs, so `/en/...` is indistinguishable from the unprefixed URL. English is chosen through the language switcher, which rewrites the cookie.

Validation (isolated server): 12 redirect scenarios pass — no cookie → 200; `ko`/`uz` cookie on `/`, `/property?input=…`, `/tour/detail?id=…` → one 307 with the query preserved; explicit `/ko/...` with a `uz` cookie → 200; unsupported cookie value → 200; static files and `/auth/*` callbacks untouched; client-side transitions never redirected; no redirect loop; `<html lang="ko">` on the first response.

## Phase 2 — global shared components ✅

Changed: `Top.tsx`, `Footer.tsx`, `common/GlobalSearch.tsx`, `common/FollowButton.tsx`, `common/LikeButton.tsx`, `common/SaveButton.tsx`, `layout/LayoutBasic.tsx`, `layout/LayoutHome.tsx`, `libs/sweetAlert.ts`, `libs/config.ts`, `libs/enums/common.enum.ts`, `apollo/client.ts`.

- Global search (placeholder, ARIA label, loading/error/empty states, group headings), follow/like/save buttons, footer social labels, layout `<title>`/meta are translated.
- Navbar flag images are decorative (inside an `aria-hidden` wrapper) and now carry `alt=""`; language options are rendered from one list.
- SweetAlert helpers: confirm/cancel/login/OK buttons are translated instead of relying on the library defaults.
- `Message` and `Messages` constants now hold dictionary keys; every usage is wrapped (`t(Message.NOT_AUTHENTICATED)`), 30 call sites.
- Applied across the whole frontend in the same pass, because the shared constants changed: `err.message` in alerts → `tError(err)`, and directly rendered enum fields → `tEnum(...)` (82 files touched).

Validation: `tsc --noEmit` clean; `npm run i18n:check` passes (398 keys × 3); smoke test of 19 routes × 3 locales on the isolated server → 57/57 return 200 with the correct `<html lang>`.

## Phase 3 — Home ✅

Changed: `homepage/Hero.tsx`, `Experiences.tsx`, `SpecialStays.tsx`, `CommunityCurators.tsx`, `LiveDispatches.tsx`, `pages/index.tsx`.

- Stay-type dropdown shows translated labels instead of raw enum values; the `t` shadowing in `STAY_TYPES.map` is gone.
- Tour status and member type badges go through `tEnum`.
- Plural forms added for guests, stays, tours, views and capacity (`…_one`); "1 guests" no longer occurs.
- View counts use locale-aware compact notation instead of a literal `k`.
- Follow/favourite failure alerts and the sign-in prompt are translated; the hero image has a real `alt` text.
- The stray `;` rendered between two sections was removed.
- Left as is: the six city names in the hero location list. They were hardcoded by another edit during the audit and are place names, not UI copy; `AGENTS.md` §9.1 still asks for API data there.

## Phase 4 — Hotels ✅

Changed: all 12 files under `libs/components/property/` and `pages/property/` (the calendar component written by the other process already used `useI18n`; only its number formats were pinned).

- 125 strings moved to `hotels.*` / `common.*` keys; property type, status and amenity labels come from `enums.propertyType.*` and `amenities.*` (stored values stay untouched and unknown amenities are shown as stored).
- **Sort state no longer holds English labels.** It now stores `RECOMMENDED`, `PRICE_ASC`, `PRICE_DESC`, `RATING_DESC`, `NEWEST`; the mapping to API sort fields is unchanged.
- Plural-safe messages replace string concatenation (reviews, photos, travellers, nights, total properties, guests).
- USD amounts are pinned to `en-US` grouping (`$1,234`) in every locale, per `AGENTS.md` §9.2; counts use the locale formatter; review dates use `formatDate`.
- MUI pagination ARIA labels are translated.

## Phase 5 — Tours and Destinations ✅

Changed: all files under `libs/components/tour/`, `pages/tour/`, `libs/components/destination/`, `pages/destination/`, plus `libs/utils.ts`.

- Tours: 134 strings; sort state uses stable ids (`DEPARTURE_ASC`, `POPULAR`, …); durations are `t('common.days', { count })`; dates use `formatDate`; seat, traveller and total counts are plural-safe.
- Destinations: 114 strings, including region tabs, rating labels, gallery ARIA labels, the generated fallback descriptions, titles and meta descriptions; relative times use `formatRelativeTime`.
- `libs/utils.ts`: `formatApiDate` and `getDateDuration` (which returned English text) were replaced by the text-free `getDurationDays`.

Validation after phases 3–5: `tsc --noEmit` clean; `npm run i18n:check` passes (769 keys × 3). Server-rendered `/ko/property` went from 59 English text nodes to 8 (brand, currency, language names); `/ko/tour` and `/ko/destination` show 6 each.

## Phase 6 — Customer support ✅ (About skipped)

Changed: `pages/cs/index.tsx`, `libs/components/cs/CsContactForm.tsx`.

- The whole support page is translated: hero, search, quick prompts, six topic cards, **all eight FAQ questions and answers**, contact section, concierge panel, closing call to action.
- Six FAQ answers contain an inline link or emphasised path. Each is now one message with a `{{link}}` placeholder rendered through `tx`, so Korean and Uzbek can place the link where their grammar needs it.
- Quick prompts put the translated phrase into the search box.
- Form: file-type, size, upload and minimum-length alerts, name/email placeholders and the "Attached: …" line are translated.
- **Mobile stub removed.** The page returned the literal `CS PAGE MOBILE` on phones. It now renders the same content for every device (`scss/pc/cs/cs.scss` already styles `.cs-page` under both `#pc-wrap` and `#mobile-wrap`). Phone layout was not checked visually.
- The page has its own `<title>` now (it used to inherit the hotels title).
- About: there is no `/about` page, by decision nothing was created. The footer link still leads to a 404.

## Phase 7 — Authentication ✅

Changed: `account/SignIn.tsx`, `account/SignUp.tsx`, `pages/account/*`, `pages/auth/kakao/callback.tsx`, `pages/auth/telegram/callback.tsx`, `libs/auth/social.ts`.

- 94 strings: headings, labels, placeholders, validation and result alerts, social buttons, side-panel copy, titles and meta descriptions, callback status messages.
- The terms sentence is one message with `{{terms}}` and `{{privacy}}` link placeholders.
- Telegram callback: whitelisted API messages are translated through `serverErrors.*`.
- `libs/auth/social.ts` helper messages use `translateActive`; the Google button receives the active locale.

## Phase 8 — Checkout ✅

Changed: `pages/checkout/index.tsx`, `property/detail/PropertyPaymentModal.tsx`.

- The existing `payment.*` keys are finally connected (Secure Payment, Price Summary, Total Due, Pay, Processing); 28 more strings translated, including every payment error and the confirmation screen.
- Night, guest and traveller counts are plural-safe; the footer line reuses `footer.rights`.
- Stripe Elements receives a locale: `en`, `ko`, and `auto` for Uzbek (Stripe has no Uzbek translation, so it falls back to the browser language). Amounts, currency and the payment flow are unchanged.

Validation after phases 6–8: `tsc --noEmit` clean; `/ko/cs` server HTML went from 85 English text nodes to 6, with FAQ answers in Korean and the inline links intact.

## Phase 9 — Community ✅

Changed: all 14 files under `libs/components/community/` and `pages/community/`.

- 116 strings translated: header, category tabs, cards, sidebar, write/edit story form, detail page, comments, engagement bar, related stories, titles and meta.
- Category labels: the four separate English maps are gone. Tabs, related cards and the detail page use `enums.articleCategory.*`; the card badge keeps its own singular wording (`community.card.category.*`). The detail page's stray "Travel Tips" label for `GUIDE` now matches the tab ("Expedition Logs").
- Sort dropdown: the trigger shows the translated label of the current option. The values kept in state and in the `sort` query parameter (`Trending`, `Latest`, `Top Rated`) were left unchanged so existing links keep working; they are identifiers now, never displayed.
- Relative comment times use `formatRelativeTime`; dates use `formatDate`; host/organizer subtitles and the "Showing X of Y stories" line are plural-safe single messages.
- Two strings missed by the audit (`Unnamed host`, `Unnamed organizer`) were found after fixing an over-broad exclusion rule in the extractor, and translated.

## Phase 10 — Chat and member profile ✅

Changed: `libs/components/chat/*`, `pages/chat/index.tsx`, `libs/components/member/*`, `pages/member/index.tsx`.

- Chat: 61 strings (conversation list, thread, connection states, composer, delete dialog, dossier). Message times follow the active locale.
- Member profile: 123 strings. Sentences that were assembled around an English noun ("No hotel yet", "has not published any tour yet") are full messages per product kind.
- Two placeholder values that were presented as real data were replaced by honest fallbacks: the invented default biography (now "This member has not added a bio yet.") and the hardcoded join date "May 2022" (now "Date unavailable").
- Follower counts use locale-aware compact notation.

## Phase 11 — My Page and agent workspace ✅

Changed: all files under `libs/components/mypage/` and `pages/mypage/index.tsx`.

- My Page: 243 strings (sidebar, header, bookings, notifications, wishlist, history, articles, followers, following, settings, partner application, tab titles). `Log Out` uses the existing `auth.logout` key; booking status chips use `booking.*`.
- Agent workspace: 125 strings (hotel and tour forms, three management tables, reservations). Status and type dropdowns show translated enum labels; pagination lines are single messages.
- Dates use `formatDate`; MUI pagination ARIA labels are translated.

Validation after phases 9–11: `npm run i18n:check` passes; `tsc --noEmit` reports no error in any migrated file. One unrelated error exists in `libs/components/destination/detail/DestinationAbout.tsx` (`Cannot find name 'Link'`): the file was reformatted by another process at 02:29 and its `next/link` import was removed there. It was left untouched, per the rule not to revert concurrent work.

## Phase 12 — Admin panel ✅

Changed: all 13 routes under `pages/_admin/`, `libs/components/admin/UserDrawer.tsx`, `libs/components/layout/LayoutAdmin.tsx`.

- 526 strings: sidebar, page headings, table headers, filters, drawers, SweetAlert dialogs (titles, texts, buttons), toasts, CSV export headers.
- Every status, type and category column and dropdown uses `tEnum`; "Activate/Deactivate" dialogs are explicit messages instead of text built from an English verb.
- Dates use `formatDate`; "last active" uses `formatRelativeTime`.
- **Not translated on purpose:** 14 literals of invented sample data that some drawers show when a field is empty ("Julian Laurent", "Swiss Alpine Atelier", a sample marketing paragraph, sample document names and sizes). They are placeholder data, not interface copy, and conflict with `AGENTS.md` §9.1; they need a product decision (remove, or replace with an empty state).

## Phase 13 — Cleanup and validation ✅

- Leftover raw enum displays, three badge strings the audit's detector could not see (lowercase-only templates such as `${n} unread`) and unused `moment` imports were cleaned up.
- Four keys created during the migration but never used were removed again.

### Final state

| Measure | Audit baseline | Now |
| --- | ---: | ---: |
| Hardcoded string findings | 2,019 | **22** (6 city names in the hero list, 14 admin sample-data literals, 2 false positives that are dictionary keys) |
| UI files using `useI18n` | 11 of 122 | **119 of 122** (the other three render no text) |
| `t()` call sites | 148 | 2,001 |
| Dictionary keys per locale | 174 | **1,791** (identical key set in `en`, `ko`, `uz`) |
| Raw enum values rendered | 62 sites | 0 |
| Dates/numbers pinned to English or the runtime default | 80 | 0 outside USD amounts (deliberately `en-US`) and machine formats (`YYYY-MM-DD`) |
| Plurals built by concatenation | 18 | 0 |
| Alerts showing a raw exception/API message | 66 | 0 (all go through `tError`; unknown API messages are still shown as received) |

### Checks that were run

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | clean |
| `npm run i18n:check` | passes: 1,791 keys × 3, placeholders match, no key used in code is missing |
| `next build` (isolated copy of the repo, never in the working tree) | succeeds: lint and type validation pass, 136 static pages, middleware compiled |
| Smoke test on that production build | 19 routes × 3 locales = 57/57 return 200 with the correct `<html lang>` |
| Saved-language redirects on the production build | 12 scenarios pass (single 307, query preserved, `/ko` and `/uz` URLs respected, no loop) |
| Server-rendered Korean pages | Home, hotels, tours, destinations, community, support, sign-in, chat, My Page, checkout: the only ASCII-only text left is `KOR`, `English`, `O‘zbekcha`, `USD ($)`, `TV`, `256-bit SSL`, `Kakao`, `Telegram` |

Not exercised: a real browser session (modals, toasts, data-loaded cards), signed-in and admin screens at runtime, phone rendering, Stripe/Google widgets, the backend.

## Open items

| Item | Why it is open |
| --- | --- |
| Native review of the new Korean and Uzbek text | About 1,600 strings per language were written during this migration and have not been proofread by a native speaker. The terminology questions listed in the audit (section 6.5) still apply to the older Uzbek strings, which were not changed. |
| About page | Skipped by decision; `/about` still returns 404 from the footer link. |
| Hero location list | Six literal city names added by another edit; not translated and not API-driven. |
| Admin sample data | See Phase 12. |
| Unused keys | 16 remain: 13 that predate the migration (`navigation.savedWishlist`, `common.error`, `common.viewAll`, `common.search`, `common.noResults`, `common.night`, `common.nights`, `common.traveler`, `common.travelers`, `booking.bookNow`, `booking.pending`, `payment.pay`, `auth.signup`) and 3 `availability.*` keys owned by the calendar work. `npm run i18n:check -- --unused` fails on them. |
| Bundle size | The three dictionaries (about 95–104 KB each, uncompressed) are imported statically, so every visitor downloads all languages. Loading only the active locale needs a small change to `libs/i18n/index.tsx` and is worth doing before launch. |
| Text produced by the API | Notification titles and bodies are rendered as the backend sends them. Only error messages are mapped on the client. |
| Stripe for Uzbek | Stripe Elements has no Uzbek translation; `uz` uses Stripe's browser-language fallback. |
| `hreflang` alternates | Not added: they need absolute URLs and no public site origin is configured in the frontend. |
| Korean web font | Not added; Hangul still falls back to system fonts (design decision). |
| Community sort identifiers | Kept as `Trending` / `Latest` / `Top Rated` in state and URL for link compatibility; no longer displayed. |
| English count labels | A few labels such as `{{maxGuests}} Guests` in spec chips are not plural-aware in English ("1 Guests"). |
| Commit | Only the checkpoint (`ca56e00`) was committed. The migration itself is uncommitted: 135 modified files plus `middleware.ts`, `libs/i18n/serverMessages.ts` and this log. The calendar process's files are in the same working tree. |
