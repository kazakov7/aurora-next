# AURORA — Final i18n & Hardcoded UI Audit

| | |
| --- | --- |
| Repository | `aurora-next` (Next.js 14.2.0 Pages Router, React 18, Apollo Client) |
| Snapshot | Working tree of branch `develop` (HEAD `3116de4` plus uncommitted changes) as of 2026-10-11 01:09 KST |
| Locales | `en` (default), `ko`, `uz` (Latin) |
| Audit type | Read-only. No application source, dictionary, dependency, backend or database change was made. The only file written is this report. |
| Supersedes | `docs/i18n-audit.md` (earlier estimate-level audit) |

> **About the brief.** The audit brief that was supplied ends mid-sentence inside section G (“About Us … Team section,”). Sections A–G were audited as written. Every remaining part of the frontend (auth, checkout, customer support, chat, member profile, My Page, agent workspace, admin) was audited under the brief's stated objective of covering the entire frontend. Any report-format requirements that followed the cut-off were not available.

---

## 1. Verdict

**The frontend is not multilingual yet. Only the navigation bar, the footer, the seven Home sections and the support contact form go through the translation system. Everything else renders hardcoded English in all three locales.**

| Measure | Value |
| --- | ---: |
| Route files under `pages/` | 32 |
| Files that render JSX (excluding 3 unreferenced components) | 121 |
| …of which call `useI18n()` | **10** |
| `t()` call sites | 135 |
| Dictionary keys per locale | 157 (parity verified, 0 missing, 0 extra) |
| **Hardcoded user-facing string occurrences** | **2,021** (1,322 distinct texts) |
| …in customer-facing code (everything except admin) | 1,450 |
| …in the admin panel | 571 |
| Raw GraphQL enum values rendered as text | 62 sites (29 outside admin) |
| Date/number calls pinned to `en` / `en-US` | 15 |
| Date/number calls with no locale (runtime default, not the app locale) | 65 |
| Alerts that pass a backend/exception message straight to the user | 66 |
| Dictionary keys that are defined but never used | 25 |

What a Korean or Uzbek visitor sees today, confirmed against the running dev server (server-rendered HTML, desktop user agent):

| URL | `<html lang>` | Text nodes in initial HTML | ASCII-only nodes (English, plus brand/currency/language names) |
| --- | --- | ---: | ---: |
| `/ko` | `ko` | 72 | 6 |
| `/ko/property` | `ko` | 83 | 59 |
| `/ko/destination` | `ko` | 50 | 26 |
| `/ko/cs` | `ko` | 112 | 85 |
| `/ko/mypage` | `ko` | 61 | 37 |

On `/ko/property`, `/uz/tour`, `/ko/destination`, `/uz/community`, `/ko/cs` and `/uz/account/join` the only translated text is the navbar and the footer; the whole page body is English.

### Hardcoded strings by area

| Area | UI files | Using `useI18n` | `t()` calls | Text | Attr | A11y | Meta | Alert | Label | **Hardcoded total** | Priority |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Global shell | 8 | 2 | 32 | 7 | 1 | 10 | 4 | 0 | 7 | **29** | P1 |
| Shared libraries | — | — | 0 | 0 | 0 | 0 | 0 | 10 | 17 | **27** | P0 |
| Home | 8 | 7 | 82 | 0 | 0 | 0 | 0 | 2 | 6 | **8** | P1 |
| Auth | 7 | 0 | 0 | 50 | 3 | 11 | 3 | 28 | 6 | **101** | P0 |
| Hotels | 11 | 0 | 0 | 116 | 2 | 8 | 1 | 9 | 23 | **159** | P0/P1 |
| Tours | 11 | 0 | 0 | 113 | 2 | 8 | 2 | 9 | 5 | **139** | P0/P1 |
| Destinations | 13 | 0 | 0 | 88 | 1 | 18 | 3 | 3 | 13 | **126** | P1 |
| Community | 14 | 0 | 0 | 77 | 3 | 11 | 2 | 21 | 36 | **150** | P1 |
| Customer support | 2 | 1 | 21 | 80 | 3 | 0 | 0 | 5 | 1 | **89** | P1 |
| Checkout | 1 | 0 | 0 | 22 | 0 | 1 | 0 | 7 | 0 | **30** | P0 |
| Chat | 5 | 0 | 0 | 56 | 2 | 8 | 1 | 10 | 13 | **90** | P2 |
| Member profile | 7 | 0 | 0 | 69 | 2 | 11 | 1 | 21 | 13 | **117** | P2 |
| My Page | 14 | 0 | 0 | 174 | 11 | 6 | 1 | 20 | 41 | **253** | P2 |
| Agent workspace | 5 | 0 | 0 | 101 | 3 | 12 | 0 | 16 | 0 | **132** | P2 |
| Admin | 15 | 0 | 0 | 434 | 11 | 11 | 0 | 34 | 81 | **571** | P3 |
| **Total** | **121** | **10** | **135** | | | | | | | **2021** | |

“Shared libraries” are non-component modules (`libs/sweetAlert.ts`, `libs/utils.ts`, `libs/config.ts`, `libs/enums/common.enum.ts`, `libs/auth/social.ts`) whose strings surface through alerts and labels on many pages.

Column meaning: **Text** = JSX text and string expressions rendered as children; **Attr** = `placeholder`/`label`-type attributes; **A11y** = `aria-label`, `alt`, `title`; **Meta** = `<meta content>`; **Alert** = SweetAlert / inline error and status messages; **Label** = label constants, lookup maps, fallback names, CSV export headers.

### Priority legend

| Priority | Meaning |
| --- | --- |
| **P0** | Transactional or trust-critical: sign-in/up, booking widgets, checkout, payment, error and confirmation alerts |
| **P1** | Public browsing: hotels, tours, destinations, community, support page, global search, page titles |
| **P2** | Signed-in areas: My Page, member profile, chat, agent workspace |
| **P3** | Admin panel, accessibility-only labels, typography |

---

## 2. Method and limits

**How the numbers were produced.** Every `.ts`/`.tsx` file under `pages/`, `libs/` and `apollo/` (185 files) was parsed with the TypeScript compiler API already present in `node_modules`. Each string literal, template literal and JSX text node was recorded with its syntactic context (JSX child, attribute name, call target, object key, variable name). Icon ligature names inside `material-symbols-outlined` elements (463 nodes), imports, `className`/`sx`/`style` values, GraphQL documents, comparisons, router paths, enum definitions and other technical literals were excluded by rule. The remaining candidates were reviewed file by file. A second pass detected patterns that are not string literals: enum fields rendered directly, locale-pinned formatting calls, plural concatenation and exception-message passthrough.

**Confirmed vs. inferred.** A finding is listed as confirmed when the source shows the string reaching the DOM or an alert. Where the audit relies on documented third-party behaviour or could not observe a result, the text says so.

**Runtime checks performed.** `GET` requests against the running dev server for 12 locale-prefixed URLs (HTTP status, `<html lang>`, visible text and attribute extraction); `node scripts/check-i18n.mjs`.

**Not verified.**

- No browser session was driven, so client-only states (data-loaded cards, modals, toasts, hover states) were audited from source, not observed.
- Signed-in, agent and admin pages were audited from source only.
- Mobile rendering was not observed. `useDeviceDetect` switches on the user agent inside `useEffect`, so server HTML is always the desktop tree.
- The language of text produced by the NestJS backend (GraphQL error messages, notification titles) cannot be determined from this repository.
- Stripe, Google, Kakao and Telegram widgets were not rendered.
- Korean font fallback was reasoned from the stylesheets, not inspected visually.

**Working tree changed during the audit.** Between 00:50 and 01:02 on 2026-10-11 other edits landed in the working tree: `libs/components/homepage/Hero.tsx` was reformatted and its location list was changed from API data to six literal city names; `libs/i18n/messages/uz.json` was re-saved; `public/img/banner/hero_traveler.jpg` was deleted and replaced by `hero_traveler.avif`. None of these edits were made by the audit. All extraction was re-run afterwards, and 239 `file:line` citations in sections 3–6 were machine-checked against the tree at the snapshot time above. Line numbers will drift if those files keep changing.

---

## 3. i18n infrastructure findings

The translation layer itself is small and works: `libs/i18n/index.tsx` exposes `I18nProvider` and `useI18n()` with dot-path lookup, English fallback and `{{var}}` interpolation; `next.config.js` declares the three locales; `_document.tsx` sets `<html lang>` from the active locale (confirmed at runtime for `en`, `ko`, `uz`). The issues below limit how far it can go.

| # | Finding | Evidence | Priority |
| --- | --- | --- | --- |
| I-1 | **Saved language is applied only on the client, after an English first paint.** `localeDetection` is `false`, and in Next 14.2.0 the `NEXT_LOCALE` cookie is honoured only when `localeDetection !== false`. The cookie written by `changeLocale` therefore has no server effect. The saved choice is restored by a `router.replace` inside `useEffect`. A returning Korean or Uzbek user who opens an unprefixed URL (`/`, `/property`, any bookmarked or emailed link) receives English HTML with `lang="en"` and is then switched client-side. | `next.config.js:7`; `libs/i18n/index.tsx:40` (cookie), `:45-51` (client redirect); `node_modules/next/dist/shared/lib/i18n/get-locale-redirect.js` (`localeDetection !== false` guard) | P1 |
| I-2 | **A saved preference overrides the locale in the URL.** The same effect replaces the route whenever `localStorage['aurora-locale']` differs from `router.locale`. A user whose saved language is `uz` cannot open a shared `/ko/...` link in Korean; only the switcher changes language. | `libs/i18n/index.tsx:45-51` | P2 |
| I-3 | **Logout drops the locale prefix.** `logOut()` assigns `window.location.href = '/'`, which loads the default-locale URL; the language comes back only through the client redirect in I-1. | `libs/auth/index.ts:124` | P2 |
| I-4 | **No plural support.** `t()` interpolates only. Count messages are single strings, so English renders “1 guests”, “1 stays”, “1 tours”, “1 views”, “1 guests max”. Outside the dictionary, 18 sites build plurals by concatenating `'s'`/`'ies'`, which cannot be translated (Korean and Uzbek do not pluralise this way). | `libs/i18n/index.tsx:30-31`; `Hero.tsx:339` with `home.hero.guests`; Appendix E | P1 |
| I-5 | **Translations are reachable only from React components.** `t` comes from a hook, so module-level code cannot use it: `libs/sweetAlert.ts`, `libs/utils.ts`, `libs/config.ts`, `libs/enums/common.enum.ts`, `libs/auth/social.ts`, `apollo/client.ts`. Every alert helper takes an already-built English string. | `libs/sweetAlert.ts:71`, `:116`; `libs/utils.ts:20`, `:26`, `:28`; `libs/config.ts:40-46`; `libs/enums/common.enum.ts:12-13` | P0 |
| I-6 | **Dates, numbers and relative times ignore the active locale.** 15 calls pin `'en'`/`'en-US'`; 65 calls pass no locale and therefore use the Node or browser default instead of the app language; `moment` is never given a locale, so 16 display formats and both `fromNow()` calls produce English (“3 days ago”, “Oct 11, 2026”). Compact counts append a literal `k`. | Appendix D; `libs/utils.ts:20`; `MyProfileNotifications.tsx:277`; `DestinationReviews.tsx:235`; `LiveDispatches.tsx:18` | P1 |
| I-7 | **Raw enum values are rendered as text** at 62 sites: `HOTEL`, `ACTIVE`, `PENDING`, `USER`, `AGENT`, `CONFIRMED` and so on reach the page untranslated, including on the Home page. | Appendix C | P1 |
| I-8 | **Labels double as state and logic values.** Sort dropdowns store the English label in state and branch on it (`'Price: Low to High'`, `'Top Rated'`, `'Trending'`). Translating the label without separating value from label breaks sorting. | `pages/property/index.tsx:90-97`, `:260-268`; `pages/tour/index.tsx:77-88`; `pages/community/index.tsx:60`; `CommunityHeader.tsx:18-20` | P1 |
| I-9 | **Backend text is shown verbatim.** 66 alert calls display `err.message` (24 with no fallback at all), and the global Apollo error link shows every GraphQL error message. Notification titles and bodies are rendered as received. Amenity names are stored and displayed as English values. The language of all of these is decided by the API. | Appendix F; `apollo/client.ts:118`; `MyProfileNotifications.tsx:273`, `:276`; `libs/config.ts:10-26` | P0 |
| I-10 | **Third-party UI is not given the app locale.** Stripe `Elements` receives only `clientSecret`; the Google button is rendered without a `locale` option; `sweetConfirmAlert` relies on SweetAlert2's default “OK”/“Cancel” buttons; the MUI theme is created without a locale, so `Pagination` keeps its English ARIA labels (4 usages); native `<input type="date">` follows the browser language. Per Stripe's documentation Uzbek is not among Elements' supported locales, so `uz` users will need a deliberate fallback. Rendering of these widgets was not observed. | `pages/checkout/index.tsx:300`; `libs/auth/social.ts:113-121`; `libs/sweetAlert.ts:46-54`; `pages/_app.tsx:15` | P0 (Stripe), P2 |
| I-11 | **Page titles and meta descriptions are hardcoded English** in 39 `<title>`/`<meta>` elements, and there are no `hreflang` alternates or `og:locale`. Pages without their own `<Head>` inherit “AURA Hotels & Sanctuaries” from `LayoutBasic`, so the support page carries the hotels title (confirmed at runtime on `/ko/cs`). | Appendix G; `LayoutBasic.tsx:17`; `pages/cs/index.tsx` (no `next/head`) | P1 |
| I-12 | **Brand spelled two ways.** `AURA` appears 70 times in 31 UI files (titles, headings, alerts); `AURORA` appears 14 times. 32 of the 39 title/meta elements say “AURA”. Translators need one canonical name. | Appendix G; e.g. `LayoutHome.tsx:17`, `SignIn.tsx:163`, `MyProfileSidebar.tsx:112` | P1 |
| I-13 | **The parity check cannot see the real gap.** `npm run i18n:check` passes (157 keys × 3) but only compares key trees. It does not detect hardcoded literals, unused keys or keys missing from code. | `scripts/check-i18n.mjs` | P2 |
| I-14 | **`t` is shadowed in the hero.** `STAY_TYPES.map((t) => …)` reuses the name of the translation function, so inside that callback `t` is an enum value. It is harmless today only because the callback prints the enum; the first attempt to translate that label there will fail. | `Hero.tsx:218`, `:229` | P2 |
| I-15 | **Mobile branch is a stub.** Only one page branches on device, and it returns the literal `CS PAGE MOBILE`. No other page or `Top.tsx` has mobile-specific markup; the layouts wrap the same tree in `#mobile-wrap`. | `pages/cs/index.tsx:21`; `LayoutBasic.tsx:13`; `LayoutHome.tsx:13` | P1 |
| I-16 | **No Korean web font.** The loaded families (Inter, Plus Jakarta Sans, Playfair Display) contain no Hangul, so Korean text falls back to `-apple-system, BlinkMacSystemFont, sans-serif`, and serif headings to the platform default serif. This is an inference from the stylesheets. | `scss/variables.scss:3-8`; `pages/_document.tsx:26-33` | P3 |

---

## 4. Route inventory

32 route files. For each route the tree lists every component file reached through imports from `libs/components/`, with the number of hardcoded strings and `t()` calls in that file. Shared files (`Top`, `Footer`, `GlobalSearch`, `AuroraLogo3D`) are repeated under each layout.

Three component files are not imported by any route and were excluded from all counts: `libs/components/TravelHeroAnimation.tsx` (with `travelHeroData.ts`), `libs/components/common/SaveButton.tsx`, `libs/components/property/detail/PropertyPaymentModal.tsx`. Together they hold about 24 English UI strings that would surface if the components are wired in.

Routes named in the brief or in `AGENTS.md` that do not exist: **`/about`** (404 in all locales, linked from the footer), a floating `Chat.tsx` widget, `LayoutMain`/`LayoutFull`.

<details>
<summary>Route → component tree (32 routes)</summary>

- **`/_admin/agent-verification`** (`pages/_admin/agent-verification/index.tsx`) — 70 hardcoded in page file; **87 in full tree**
  - `layout/LayoutAdmin.tsx` — 17 hardcoded
    - `AuroraLogo3D.tsx` — 0 hardcoded
- **`/_admin/bookings`** (`pages/_admin/bookings/index.tsx`) — 19 hardcoded in page file; **36 in full tree**
  - `layout/LayoutAdmin.tsx` — 17 hardcoded
    - `AuroraLogo3D.tsx` — 0 hardcoded
- **`/_admin/community`** (`pages/_admin/community/index.tsx`) — 46 hardcoded in page file; **63 in full tree**
  - `layout/LayoutAdmin.tsx` — 17 hardcoded
    - `AuroraLogo3D.tsx` — 0 hardcoded
- **`/_admin/cs`** (`pages/_admin/cs/index.tsx`) — 50 hardcoded in page file; **67 in full tree**
  - `layout/LayoutAdmin.tsx` — 17 hardcoded
    - `AuroraLogo3D.tsx` — 0 hardcoded
- **`/_admin/destinations`** (`pages/_admin/destinations/index.tsx`) — 40 hardcoded in page file; **57 in full tree**
  - `layout/LayoutAdmin.tsx` — 17 hardcoded
    - `AuroraLogo3D.tsx` — 0 hardcoded
- **`/_admin`** (`pages/_admin/index.tsx`) — 28 hardcoded in page file; **45 in full tree**
  - `layout/LayoutAdmin.tsx` — 17 hardcoded
    - `AuroraLogo3D.tsx` — 0 hardcoded
- **`/_admin/notifications`** (`pages/_admin/notifications/index.tsx`) — 23 hardcoded in page file; **40 in full tree**
  - `layout/LayoutAdmin.tsx` — 17 hardcoded
    - `AuroraLogo3D.tsx` — 0 hardcoded
- **`/_admin/properties`** (`pages/_admin/properties/index.tsx`) — 83 hardcoded in page file; **100 in full tree**
  - `layout/LayoutAdmin.tsx` — 17 hardcoded
    - `AuroraLogo3D.tsx` — 0 hardcoded
- **`/_admin/reviews`** (`pages/_admin/reviews/index.tsx`) — 21 hardcoded in page file; **38 in full tree**
  - `layout/LayoutAdmin.tsx` — 17 hardcoded
    - `AuroraLogo3D.tsx` — 0 hardcoded
- **`/_admin/settings`** (`pages/_admin/settings/index.tsx`) — 6 hardcoded in page file; **23 in full tree**
  - `layout/LayoutAdmin.tsx` — 17 hardcoded
    - `AuroraLogo3D.tsx` — 0 hardcoded
- **`/_admin/support`** (`pages/_admin/support/index.tsx`) — 41 hardcoded in page file; **58 in full tree**
  - `layout/LayoutAdmin.tsx` — 17 hardcoded
    - `AuroraLogo3D.tsx` — 0 hardcoded
- **`/_admin/tours`** (`pages/_admin/tours/index.tsx`) — 43 hardcoded in page file; **60 in full tree**
  - `layout/LayoutAdmin.tsx` — 17 hardcoded
    - `AuroraLogo3D.tsx` — 0 hardcoded
- **`/_admin/users`** (`pages/_admin/users/index.tsx`) — 38 hardcoded in page file; **101 in full tree**
  - `layout/LayoutAdmin.tsx` — 17 hardcoded
    - `AuroraLogo3D.tsx` — 0 hardcoded
  - `admin/UserDrawer.tsx` — 46 hardcoded
- **`/account/join`** (`pages/account/join.tsx`) — 3 hardcoded in page file; **99 in full tree**
  - `layout/LayoutBasic.tsx` — 4 hardcoded
    - `Top.tsx` — 4 hardcoded, 13 t()
      - `AuroraLogo3D.tsx` — 0 hardcoded
      - `common/GlobalSearch.tsx` — 8 hardcoded
    - `Footer.tsx` — 3 hardcoded, 19 t()
  - `account/SignIn.tsx` — 35 hardcoded
  - `account/SignUp.tsx` — 42 hardcoded
- **`/account/login`** (`pages/account/login.tsx`) — 2 hardcoded in page file; **56 in full tree**
  - `layout/LayoutBasic.tsx` — 4 hardcoded
    - `Top.tsx` — 4 hardcoded, 13 t()
      - `AuroraLogo3D.tsx` — 0 hardcoded
      - `common/GlobalSearch.tsx` — 8 hardcoded
    - `Footer.tsx` — 3 hardcoded, 19 t()
  - `account/SignIn.tsx` — 35 hardcoded
- **`/account/signup`** (`pages/account/signup.tsx`) — 2 hardcoded in page file; **63 in full tree**
  - `layout/LayoutBasic.tsx` — 4 hardcoded
    - `Top.tsx` — 4 hardcoded, 13 t()
      - `AuroraLogo3D.tsx` — 0 hardcoded
      - `common/GlobalSearch.tsx` — 8 hardcoded
    - `Footer.tsx` — 3 hardcoded, 19 t()
  - `account/SignUp.tsx` — 42 hardcoded
- **`/auth/kakao/callback`** (`pages/auth/kakao/callback.tsx`) — 6 hardcoded in page file; **6 in full tree**
- **`/auth/telegram/callback`** (`pages/auth/telegram/callback.tsx`) — 11 hardcoded in page file; **11 in full tree**
- **`/chat`** (`pages/chat/index.tsx`) — 3 hardcoded in page file; **113 in full tree**
  - `layout/LayoutBasic.tsx` — 4 hardcoded
    - `Top.tsx` — 4 hardcoded, 13 t()
      - `AuroraLogo3D.tsx` — 0 hardcoded
      - `common/GlobalSearch.tsx` — 8 hardcoded
    - `Footer.tsx` — 3 hardcoded, 19 t()
  - `chat/ChatMessenger.tsx` — 11 hardcoded
    - `chat/ChatSidebar.tsx` — 15 hardcoded
    - `chat/ChatThread.tsx` — 23 hardcoded
    - `chat/ChatDossier.tsx` — 38 hardcoded
      - `common/FollowButton.tsx` — 4 hardcoded
- **`/checkout`** (`pages/checkout/index.tsx`) — 30 hardcoded in page file; **42 in full tree**
  - `Top.tsx` — 4 hardcoded, 13 t()
    - `AuroraLogo3D.tsx` — 0 hardcoded
    - `common/GlobalSearch.tsx` — 8 hardcoded
- **`/community/detail`** (`pages/community/detail.tsx`) — 19 hardcoded in page file; **96 in full tree**
  - `layout/LayoutBasic.tsx` — 4 hardcoded
    - `Top.tsx` — 4 hardcoded, 13 t()
      - `AuroraLogo3D.tsx` — 0 hardcoded
      - `common/GlobalSearch.tsx` — 8 hardcoded
    - `Footer.tsx` — 3 hardcoded, 19 t()
  - `community/detail/CommunityDetailBreadcrumb.tsx` — 3 hardcoded
  - `community/detail/CommunityDetailHeader.tsx` — 9 hardcoded
    - `common/FollowButton.tsx` — 4 hardcoded
  - `community/detail/CommunityDetailMedia.tsx` — 0 hardcoded
  - `community/detail/CommunityDetailBody.tsx` — 1 hardcoded
  - `community/detail/CommunityDetailEngagementBar.tsx` — 5 hardcoded
    - `common/LikeButton.tsx` — 2 hardcoded
  - `community/detail/CommunityDetailComments.tsx` — 24 hardcoded
  - `community/detail/CommunityDetailRelated.tsx` — 10 hardcoded
- **`/community`** (`pages/community/index.tsx`) — 14 hardcoded in page file; **104 in full tree**
  - `layout/LayoutBasic.tsx` — 4 hardcoded
    - `Top.tsx` — 4 hardcoded, 13 t()
      - `AuroraLogo3D.tsx` — 0 hardcoded
      - `common/GlobalSearch.tsx` — 8 hardcoded
    - `Footer.tsx` — 3 hardcoded, 19 t()
  - `community/CommunityHeader.tsx` — 7 hardcoded
  - `community/CommunityFilter.tsx` — 7 hardcoded
  - `community/CommunityCard.tsx` — 12 hardcoded
    - `common/LikeButton.tsx` — 2 hardcoded
  - `community/CommunitySidebar.tsx` — 15 hardcoded
    - `common/FollowButton.tsx` — 4 hardcoded
  - `community/WriteStoryModal.tsx` — 24 hardcoded
- **`/cs`** (`pages/cs/index.tsx`) — 81 hardcoded in page file; **108 in full tree**
  - `layout/LayoutBasic.tsx` — 4 hardcoded
    - `Top.tsx` — 4 hardcoded, 13 t()
      - `AuroraLogo3D.tsx` — 0 hardcoded
      - `common/GlobalSearch.tsx` — 8 hardcoded
    - `Footer.tsx` — 3 hardcoded, 19 t()
  - `cs/CsContactForm.tsx` — 8 hardcoded, 21 t()
- **`/destination/detail`** (`pages/destination/detail.tsx`) — 4 hardcoded in page file; **116 in full tree**
  - `layout/LayoutBasic.tsx` — 4 hardcoded
    - `Top.tsx` — 4 hardcoded, 13 t()
      - `AuroraLogo3D.tsx` — 0 hardcoded
      - `common/GlobalSearch.tsx` — 8 hardcoded
    - `Footer.tsx` — 3 hardcoded, 19 t()
  - `destination/detail/DestinationDetailHero.tsx` — 7 hardcoded
  - `destination/detail/DestinationAbout.tsx` — 23 hardcoded
  - `destination/detail/DestinationCities.tsx` — 4 hardcoded
  - `destination/detail/DestinationTopStays.tsx` — 9 hardcoded
  - `destination/detail/DestinationPopularTours.tsx` — 11 hardcoded
  - `destination/detail/DestinationTravelers.tsx` — 8 hardcoded
    - `common/FollowButton.tsx` — 4 hardcoded
  - `destination/detail/DestinationReviews.tsx` — 23 hardcoded
  - `destination/detail/DestinationContinueExploring.tsx` — 4 hardcoded
- **`/destination`** (`pages/destination/index.tsx`) — 10 hardcoded in page file; **52 in full tree**
  - `layout/LayoutBasic.tsx` — 4 hardcoded
    - `Top.tsx` — 4 hardcoded, 13 t()
      - `AuroraLogo3D.tsx` — 0 hardcoded
      - `common/GlobalSearch.tsx` — 8 hardcoded
    - `Footer.tsx` — 3 hardcoded, 19 t()
  - `destination/DestinationHero.tsx` — 3 hardcoded
  - `destination/DestinationFilter.tsx` — 16 hardcoded
  - `destination/DestinationCard.tsx` — 4 hardcoded
- **`/`** (`pages/index.tsx`) — 0 hardcoded in page file; **33 in full tree**
  - `layout/LayoutHome.tsx` — 4 hardcoded
    - `Top.tsx` — 4 hardcoded, 13 t()
      - `AuroraLogo3D.tsx` — 0 hardcoded
      - `common/GlobalSearch.tsx` — 8 hardcoded
    - `Footer.tsx` — 3 hardcoded, 19 t()
  - `homepage/Hero.tsx` — 6 hardcoded, 24 t()
  - `homepage/TrendingDestinations.tsx` — 0 hardcoded, 9 t()
  - `homepage/SpecialStays.tsx` — 1 hardcoded, 11 t()
    - `common/LikeButton.tsx` — 2 hardcoded
  - `homepage/Experiences.tsx` — 0 hardcoded, 11 t()
  - `homepage/CommunityCurators.tsx` — 1 hardcoded, 10 t()
    - `common/FollowButton.tsx` — 4 hardcoded
  - `homepage/TravelPartners.tsx` — 0 hardcoded, 9 t()
  - `homepage/LiveDispatches.tsx` — 0 hardcoded, 8 t()
- **`/member`** (`pages/member/index.tsx`) — 7 hardcoded in page file; **159 in full tree**
  - `layout/LayoutBasic.tsx` — 4 hardcoded
    - `Top.tsx` — 4 hardcoded, 13 t()
      - `AuroraLogo3D.tsx` — 0 hardcoded
      - `common/GlobalSearch.tsx` — 8 hardcoded
    - `Footer.tsx` — 3 hardcoded, 19 t()
  - `member/MemberHeader.tsx` — 15 hardcoded
    - `common/FollowButton.tsx` — 4 hardcoded
  - `member/MemberSidebar.tsx` — 13 hardcoded
  - `member/MemberArticles.tsx` — 20 hardcoded
  - `member/MemberFollowers.tsx` — 22 hardcoded
  - `member/MemberFollowing.tsx` — 23 hardcoded
  - `member/MemberProducts.tsx` — 17 hardcoded
    - `property/PropertyCard.tsx` — 12 hardcoded
      - `common/LikeButton.tsx` — 2 hardcoded
    - `tour/TourCard.tsx` — 5 hardcoded
- **`/mypage`** (`pages/mypage/index.tsx`) — 14 hardcoded in page file; **434 in full tree**
  - `layout/LayoutBasic.tsx` — 4 hardcoded
    - `Top.tsx` — 4 hardcoded, 13 t()
      - `AuroraLogo3D.tsx` — 0 hardcoded
      - `common/GlobalSearch.tsx` — 8 hardcoded
    - `Footer.tsx` — 3 hardcoded, 19 t()
  - `mypage/MyProfileHeader.tsx` — 8 hardcoded
  - `mypage/MyProfileSidebar.tsx` — 21 hardcoded
  - `mypage/MyProfileArticles.tsx` — 19 hardcoded
    - `community/WriteStoryModal.tsx` — 24 hardcoded
  - `mypage/MyProfileFollowers.tsx` — 16 hardcoded
    - `common/FollowButton.tsx` — 4 hardcoded
  - `mypage/MyProfileFollowing.tsx` — 16 hardcoded
  - `mypage/MyProfileWishlist.tsx` — 15 hardcoded
    - `mypage/WishlistPlaceCard.tsx` — 2 hardcoded
      - `common/LikeButton.tsx` — 2 hardcoded
  - `mypage/MyProfileBookings.tsx` — 44 hardcoded
  - `mypage/MyProfileVisitedTours.tsx` — 9 hardcoded
  - `mypage/MyProfileHistory.tsx` — 9 hardcoded
  - `mypage/MyProfileNotifications.tsx` — 14 hardcoded
  - `mypage/MyProfileSettings.tsx` — 19 hardcoded
  - `mypage/AgentApplicationPage.tsx` — 47 hardcoded
  - `mypage/agent/MyHotels.tsx` — 21 hardcoded
    - `mypage/agent/AgentPropertyForm.tsx` — 34 hardcoded
  - `mypage/agent/MyTours.tsx` — 22 hardcoded
    - `mypage/agent/AgentTourForm.tsx` — 35 hardcoded
  - `mypage/agent/Reservations.tsx` — 20 hardcoded
- **`/property/detail`** (`pages/property/detail.tsx`) — 6 hardcoded in page file; **126 in full tree**
  - `layout/LayoutBasic.tsx` — 4 hardcoded
    - `Top.tsx` — 4 hardcoded, 13 t()
      - `AuroraLogo3D.tsx` — 0 hardcoded
      - `common/GlobalSearch.tsx` — 8 hardcoded
    - `Footer.tsx` — 3 hardcoded, 19 t()
  - `property/detail/PropertyHeader.tsx` — 8 hardcoded
  - `property/detail/PropertyGallery.tsx` — 9 hardcoded
  - `property/detail/PropertyOverview.tsx` — 34 hardcoded
    - `common/FollowButton.tsx` — 4 hardcoded
  - `property/detail/PropertyReservationWidget.tsx` — 16 hardcoded
  - `property/detail/PropertyComments.tsx` — 21 hardcoded
  - `property/detail/SimilarProperties.tsx` — 9 hardcoded
- **`/property`** (`pages/property/index.tsx`) — 18 hardcoded in page file; **77 in full tree**
  - `layout/LayoutBasic.tsx` — 4 hardcoded
    - `Top.tsx` — 4 hardcoded, 13 t()
      - `AuroraLogo3D.tsx` — 0 hardcoded
      - `common/GlobalSearch.tsx` — 8 hardcoded
    - `Footer.tsx` — 3 hardcoded, 19 t()
  - `property/PropertyHero.tsx` — 4 hardcoded
  - `property/PropertyCard.tsx` — 12 hardcoded
    - `common/LikeButton.tsx` — 2 hardcoded
  - `property/Filter.tsx` — 22 hardcoded
- **`/tour/detail`** (`pages/tour/detail.tsx`) — 6 hardcoded in page file; **120 in full tree**
  - `layout/LayoutBasic.tsx` — 4 hardcoded
    - `Top.tsx` — 4 hardcoded, 13 t()
      - `AuroraLogo3D.tsx` — 0 hardcoded
      - `common/GlobalSearch.tsx` — 8 hardcoded
    - `Footer.tsx` — 3 hardcoded, 19 t()
  - `tour/detail/TourHeader.tsx` — 11 hardcoded
  - `tour/detail/TourGallery.tsx` — 9 hardcoded
  - `tour/detail/TourOverview.tsx` — 26 hardcoded
    - `common/FollowButton.tsx` — 4 hardcoded
  - `tour/detail/TourReservationWidget.tsx` — 16 hardcoded
  - `tour/detail/TourComments.tsx` — 21 hardcoded
  - `tour/detail/SimilarTours.tsx` — 8 hardcoded
- **`/tour`** (`pages/tour/index.tsx`) — 17 hardcoded in page file; **63 in full tree**
  - `layout/LayoutBasic.tsx` — 4 hardcoded
    - `Top.tsx` — 4 hardcoded, 13 t()
      - `AuroraLogo3D.tsx` — 0 hardcoded
      - `common/GlobalSearch.tsx` — 8 hardcoded
    - `Footer.tsx` — 3 hardcoded, 19 t()
  - `tour/TourHero.tsx` — 3 hardcoded
  - `tour/TourCard.tsx` — 5 hardcoded
    - `common/LikeButton.tsx` — 2 hardcoded
  - `tour/TourFilter.tsx` — 17 hardcoded

</details>

---

## 5. Findings by area

Each table maps the brief's checklist to what the code does. “Hardcoded” means English literal in source, shown in every locale. Full line-by-line lists are in Appendix B.

### A. Global layout — 29 hardcoded strings

| Element | Status | Evidence |
| --- | --- | --- |
| Main navbar links | Localized | `Top.tsx:74-126` |
| Secondary navigation | Does not exist | — |
| Mobile navigation | No mobile-specific markup; same DOM as desktop | `Top.tsx` |
| Footer columns, description, copyright | Localized | `Footer.tsx:20-94` |
| Footer social links | Hardcoded `aria-label`s (“Instagram Link”, “Social Updates Link”, “Video Channel Link”); all three link to `#` | `Footer.tsx:96`, `:99`, `:102` |
| Footer “About” | Localized label, **dead link** (`/about` returns 404) | `Footer.tsx:64` |
| Footer legal links | Localized labels; Privacy, Terms and Trust all point to `/cs?tab=terms`, and the support page never reads `tab`. No legal content exists to translate. | `Footer.tsx:80`, `:83`, `:86`; `pages/cs/index.tsx` |
| Currency button | “USD ($)” literal; intentional (single currency) | `Footer.tsx:37` |
| Global search | **Not localized**: placeholder, ARIA label, loading/error/empty states, result group headings | `GlobalSearch.tsx:48`, `:55`, `:62`, `:130`, `:132`, `:140-142` |
| Language selector | Works. Option names are literal endonyms in the navbar and keys in the footer (inconsistent but harmless). Flag `alt` text is English. Short codes are `EN` / `KOR` / `UZ`. | `Top.tsx:17-23`, `:159`, `:183-185`; `Footer.tsx:32-34` |
| Account dropdown | Does not exist; avatar links to `/mypage`. Log-out lives in the My Page sidebar and is hardcoded. | `Top.tsx:189-207`; `MyProfileSidebar.tsx:314` |
| Notifications | Bell `aria-label` localized; no dropdown (links to My Page) | `Top.tsx:142` |
| Wishlist indicator | Does not exist; `navigation.savedWishlist` is an unused key | — |
| Follow / Like buttons (shared) | Hardcoded: “Follow”, “Following”, “Unfollow”, “Updating...”, `aria-label` “Like”/“Unlike” | `FollowButton.tsx:35-38`; `LikeButton.tsx:28` |
| Breadcrumbs and page headers | Hardcoded in every domain (see C–F) | — |
| Page `<title>` | Hardcoded English, brand “AURA” | `LayoutBasic.tsx:17`; `LayoutHome.tsx:17` |

### B. Home — 8 hardcoded literals in home files, plus the issues below

All strings named in the brief are localized and were found in the server HTML of all three locales:

| English (`en.json`) | Key | Korean | Uzbek |
| --- | --- | --- | --- |
| Make your hassle-free vacation plans now! | `home.hero.title` | 걱정 없는 휴가를 지금 계획하세요! | Tashvishsiz ta’tilingizni hozirdan rejalang! |
| Discover Places | `home.hero.discover` | 여행지 발견 | Joylarni kashf eting |
| Plan & Book | `home.hero.plan` | 계획 및 예약 | Rejalang va bron qiling |
| Connect & Share | `home.hero.connect` | 소통 및 공유 | Bog‘laning va ulashing |
| Stay Somewhere Special | `home.stays.title` | 특별한 곳에 머무르세요 | Maxsus joyda qoling |
| Experiences Worth Taking | `home.experiences.title` | 꼭 경험해 볼 투어 | Arziydigan tajribalar |

| Section | Headings, CTAs, loading/empty/error | Remaining gaps |
| --- | --- | --- |
| Hero (`Hero.tsx`) | Localized (22 keys) | Stay-type dropdown prints raw enum (`HOTEL`, `RESORT`, `VILLA`, `APARTMENT`) at `:200` and `:229`; “1 guests” at `:339`; image `alt` reuses the unit noun `common.traveler` at `:170`; date inputs are native. At snapshot time the location dropdown is a literal list of six English city names starting at `:47` (Seoul, Tokyo, Paris, Osaka, Bangkok, Fukuoka) although the comment above it says the values come from the destinations API; the `destinations` prop is no longer read. This was introduced during the audit and also conflicts with `AGENTS.md` §9.1. |
| Trending destinations | Localized | “1 stays”, “1 tours” for a count of one |
| Special stays | Localized | Sign-in and failure alerts are English (`SpecialStays.tsx:36`, `:42`); like button `aria-label` English |
| Experiences | Localized | Badge prints raw `tourStatus` (`Experiences.tsx:102`); “1 guests max” |
| Community curators | Localized | Overline prints raw `memberType` (`CommunityCurators.tsx:171`); alerts English (`:72`, `:105`); follow button English |
| Travel partners | Localized | — |
| Live dispatches | Localized | View counts use a literal `k` suffix (`LiveDispatches.tsx:18`); “1 views” |
| Page shell | — | `<title>` “AURA Travel — Go Somewhere Extraordinary” hardcoded (`LayoutHome.tsx:17`); a stray `;` is rendered as text between two sections (`pages/index.tsx:93`, visible in server HTML) |

Sections listed in the brief that are not on the Home page: featured hotels as a separate block, top-rated properties, promotional sections, statistics counters, carousel controls, pagination.

The statement in `docs/i18n-audit.md` that “the complete Home screen is localized” is therefore not accurate: static copy is, but enum badges, alerts, shared buttons, the title and plural forms are not.

**Hero image.** `Hero.tsx:169` and `libs/config.ts:37-38` reference `/img/banner/hero_traveler.jpg`. The committed JPEG contained baked-in English text (“EXPLORE THE WORLD · YOUR ADVENTURE AWAITS”). During the audit the file was replaced by `hero_traveler.avif`, which contains no text, but the three references still point at the `.jpg`, which now returns 404 on the dev server.

### C. Hotels / Properties — 159 hardcoded strings, 0 `t()` calls

| Checklist item | Status | Evidence |
| --- | --- | --- |
| Hero title, eyebrow, description, image `alt` | Hardcoded | `PropertyHero.tsx:7-19` |
| Filters: headings, “Clear All”, destination search placeholder, price range, Min/Max | Hardcoded | `Filter.tsx:201-311` |
| Property type labels (Hotel, Resort, Villa, Apartment, Guesthouse, Motel, Hostel, Other) | Hardcoded label map | `Filter.tsx:17-24` |
| Type chips (All Stays, Villas, Resorts, Hotels, Apartments) | Hardcoded | `pages/property/index.tsx:28-32` |
| Amenities | English values from `PROPERTY_AMENITY_OPTIONS`, used both as API value and as label | `libs/config.ts:10-26` |
| Guest capacity options (“1+ Guests” …) | Hardcoded | `Filter.tsx:28-31` |
| Sort options | Hardcoded and used as state values (I-8) | `pages/property/index.tsx:90-97`, `:260-268` |
| Result count, empty state | Hardcoded; plural built by concatenation (“propert” + “y/ies”) | `pages/property/index.tsx:245-302`, `:339` |
| Card: badges (Top Rated, Popular, New), “Up to N guests”, bedrooms/beds, “From”, “/ night”, “taxes included”, “Reserve” | Hardcoded; type shown as raw enum | `PropertyCard.tsx:24-34`, `:113-167`, `:138` |
| Detail: breadcrumb, review count, Share, Like/Liked | Hardcoded; type and status shown as raw enum | `PropertyHeader.tsx:30-90`, `:48-49` |
| Detail: capacity/bedrooms/beds/bathrooms/saved/views/bookings, About, Amenities, Location, map link, host card | Hardcoded | `PropertyOverview.tsx:94-163` |
| Gallery: counters, “View all N photos”, ARIA labels | Hardcoded | `PropertyGallery.tsx:14-79` |
| Booking widget: Check-In, Check-Out, Guests, button states, price breakdown, Stripe note, validation alerts | Hardcoded | `PropertyReservationWidget.tsx:103-173` |
| Reviews: heading, sort, empty state, form, counter, validation alerts | Hardcoded | `PropertyComments.tsx:68-255` |
| Similar properties | Hardcoded | `SimilarProperties.tsx:50-119` |
| Pagination | MUI `Pagination` with default English ARIA labels | `pages/property/index.tsx:326` |
| Loading / not-found states, `<title>` | Hardcoded | `pages/property/detail.tsx:80-106` |

Left unchanged by design: property names, descriptions, addresses and review text from the API.

### D. Tours — 139 hardcoded strings, 0 `t()` calls

| Checklist item | Status | Evidence |
| --- | --- | --- |
| Hero | Hardcoded | `TourHero.tsx:24-33` |
| Filters: destination, price range, departure/return date, travelers, “Clear All”, bespoke-tour promo | Hardcoded | `TourFilter.tsx:13-14`, `:157-270` |
| Sort options | Hardcoded and used as state values | `pages/tour/index.tsx:77-88`, `:226-232` |
| Result count, empty state, `<title>` | Hardcoded; plural by concatenation | `pages/tour/index.tsx:190-246`, `:278` |
| Card: “From”, “Per traveler”, “View package”, fallbacks | Hardcoded; status raw enum; duration from `getDateDuration` (“N day(s)”) and dates from `formatApiDate` (`en-US`) | `TourCard.tsx:14-62`; `libs/utils.ts:20-28` |
| Detail header: breadcrumb, “Departs:”, Share, Like | Hardcoded; status raw enum | `TourHeader.tsx:33-102`, `:51` |
| Detail overview: Duration, Start date, End date, Availability/seats, Departure, Saved by, Views, Tour information, map, organizer card | Hardcoded | `TourOverview.tsx:79-102` |
| Itinerary headings | No structured itinerary UI exists; free text from the API is shown under “Tour information” | `TourOverview.tsx:92` |
| Booking widget: dates, seats, travelers, button states (“Reserve tour”, “Sold out”), totals | Hardcoded | `TourReservationWidget.tsx:49-83` |
| Reviews | Hardcoded; one date pinned to `en-US` | `TourComments.tsx:65-266`, `:148` |
| Similar tours, gallery | Hardcoded | `SimilarTours.tsx:36-40`; `TourGallery.tsx:9-25` |
| Loading / not-found | Hardcoded | `pages/tour/detail.tsx:80-101` |

### E. Destinations — 126 hardcoded strings, 0 `t()` calls

| Checklist item | Status | Evidence |
| --- | --- | --- |
| Hero | Hardcoded | `DestinationHero.tsx:24-27` |
| Region tabs (All, Asia, Europe, Africa, North America, South America, Oceania) | Hardcoded platform labels | `DestinationFilter.tsx:12-18` |
| Region filtering | Implemented as English country-name patterns, so it matches only English country names in the data | `pages/destination/index.tsx:20-25` |
| Heading, counter, intro, sort options | Hardcoded | `DestinationFilter.tsx:47-74` |
| Card: “Stays”, “Tours”, save label; **generated English sentence used when a description is missing** | Hardcoded | `DestinationCard.tsx:76-109`, `:97` |
| Loading, empty, pagination labels, “Showing X of Y” | Hardcoded; sentence split across elements | `pages/destination/index.tsx:202-268` |
| Detail: breadcrumb, overview heading, views/likes/comments/reviews, Share, stats cards | Hardcoded | `DestinationAbout.tsx:26-112` |
| Detail: gallery ARIA labels | Hardcoded | `DestinationDetailHero.tsx:42-80` |
| Recommended hotels | Hardcoded | `DestinationTopStays.tsx:33-117` |
| Recommended tours | Hardcoded | `DestinationPopularTours.tsx:32-124` |
| Cities / continue exploring | Hardcoded, including generated English filler sentences | `DestinationCities.tsx:17-48`; `DestinationContinueExploring.tsx:31-70` |
| Notable visitors | Hardcoded | `DestinationTravelers.tsx:19-23` |
| Reviews: rating labels (Poor … Exceptional), form, empty state | Hardcoded; relative time via unlocalized `moment().fromNow()` | `DestinationReviews.tsx:36-40`, `:107-259`, `:235` |
| `<title>` / meta | Hardcoded | `pages/destination/index.tsx:176-179`; `pages/destination/detail.tsx:241-248` |

Destination names, countries and descriptions from the API are left as stored. The generated filler sentences are platform copy and need translation.

### F. Community / Articles — 150 hardcoded strings, 0 `t()` calls

The tab set in the code is not the one in the brief. Actual tabs: **All Stories / Itineraries / Hotel Reviews / Photography / Expedition Logs / Local Insights**, mapped to categories `TOUR`, `HOTEL`, `DESTINATION`, `GUIDE`, `NEWS`.

| Checklist item | Status | Evidence |
| --- | --- | --- |
| Header, intro, “Write Story” | Hardcoded | `CommunityHeader.tsx:46-93` |
| Category tabs | Hardcoded | `CommunityFilter.tsx:10-15`, `:28` |
| Category labels on cards and related lists | Hardcoded in **four separate maps with different wording** for the same category (e.g. `NEWS` → “Local Insight”, “Local Insights”; `GUIDE` → “Expedition Log”, “Travel Tips”) | `CommunityCard.tsx:17-21`; `CommunityDetailRelated.tsx:14-18`; `pages/community/detail.tsx:21-25`; `WriteStoryModal.tsx:191-195` |
| Sort options | Hardcoded, used as state values | `CommunityHeader.tsx:18-20`; `pages/community/index.tsx:60` |
| Card: “min read”, “Read Full Dispatch”, share, fallbacks | Hardcoded; date pinned to `en-US` | `CommunityCard.tsx:27`, `:48-186` |
| Sidebar: hosts and organizers, states, alerts | Hardcoded; subtitles built by plural concatenation | `CommunitySidebar.tsx:74-247`; `pages/community/index.tsx:130`, `:159` |
| Create / edit form: labels, placeholders, category options, upload text, buttons, success and error messages | Hardcoded | `WriteStoryModal.tsx:97-270` |
| Detail: breadcrumb, published line, views/likes/comments, share messages | Hardcoded; date pinned to `en-US` | `CommunityDetailBreadcrumb.tsx:17-23`; `CommunityDetailHeader.tsx:20`, `:59-126` |
| Comments: heading, sort, form, counter, pagination, empty state, relative times (“Just now”, “N hours ago”, “N mo ago”) | Hardcoded | `CommunityDetailComments.tsx:34-41`, `:105-309` |
| Engagement bar, related articles | Hardcoded | `CommunityDetailEngagementBar.tsx:24-80`; `CommunityDetailRelated.tsx:49-64` |
| Loading / empty / error / pagination, `<title>`, alerts | Hardcoded | `pages/community/index.tsx:287-452`; `pages/community/detail.tsx:90-229` |
| Moderation UI | Admin only (section O) | — |

### G. About Us

**No About page exists.** There is no `pages/about*` file, `/about` and `/ko/about` return 404, and no component contains mission, story, statistics, “Why choose us”, “How it works”, trust or team content. The only trace is the footer link (`Footer.tsx:64`), whose label is translated (`footer.about`) and whose target is missing. There is nothing to audit for localization; the page and its content have to be written first.

### H. Authentication — 101 hardcoded strings, 0 `t()` calls (P0)

| Item | Status | Evidence |
| --- | --- | --- |
| Sign-in: headings, labels, placeholders, “Forgot password?”, “Remember this device”, button states, social buttons, side panel copy | Hardcoded | `SignIn.tsx:152-353` |
| Sign-in: validation and result alerts, identifier hints | Hardcoded | `SignIn.tsx:50-129`, `:202` |
| Sign-up: headings, labels, placeholders, password hint, terms sentence (split across three elements), button states | Hardcoded | `SignUp.tsx:195-508` |
| Sign-up: validation alerts | Hardcoded | `SignUp.tsx:62-160` |
| Google / Telegram helper messages | Hardcoded in a non-component module | `libs/auth/social.ts:126-127`, `:245-246` |
| Kakao and Telegram callback pages | Hardcoded status and error messages, titles | `pages/auth/kakao/callback.tsx:12-50`; `pages/auth/telegram/callback.tsx:13-83` |
| Session-expired and “please login” alerts | Hardcoded enum values | `libs/enums/common.enum.ts:12-13`; `apollo/client.ts:122` |
| `auth.login`, `auth.signup`, `auth.logout` keys | Defined; only `auth.login` is used, and not on these pages | `CsContactForm.tsx:178` |

The “Forgot password?” link shows an *error-style* alert saying a recovery link was sent (`SignIn.tsx:202`); the Terms and Privacy links on sign-up also open placeholder alerts (`SignUp.tsx:354`, `:367`). That copy should be settled before it is translated.

### I. Checkout and payment — 30 hardcoded strings, 0 `t()` calls (P0)

The dictionary already contains `payment.securePayment`, `payment.priceSummary`, `payment.totalDue`, `payment.pay`, `payment.processing`, but the checkout page does not use them:

| On screen | Hardcoded at | Existing unused key |
| --- | --- | --- |
| Secure Payment | `pages/checkout/index.tsx:277` | `payment.securePayment` |
| Price Summary | `pages/checkout/index.tsx:315` | `payment.priceSummary` |
| Total Due | `pages/checkout/index.tsx:334` | `payment.totalDue` |
| Pay $… / Processing... | `pages/checkout/index.tsx:82` | `payment.pay`, `payment.processing` |

Also hardcoded: page heading and intro, “Guest Information”, the Stripe notice including “Stripe is in TEST MODE.” (`:279`), configuration and date errors, “Payment Received” confirmation, all payment error messages (`:51-57`, `:158-179`), the nights/guests line with inline plural (`:325`), the footer line (`:348`) and the `<title>` (`:225`). Stripe's own form language is covered in I-10.

### J. Customer support — 89 hardcoded strings (P1)

| Item | Status | Evidence |
| --- | --- | --- |
| Contact form labels, placeholders for subject/message, category options, success and sign-in states | **Localized** (25 `support.*` keys) | `CsContactForm.tsx:174-296` |
| Contact form: file validation alerts, upload failure, minimum-length alert, name/email placeholders, “Attached: …” line | Hardcoded | `CsContactForm.tsx:67`, `:72`, `:105`, `:108`, `:129`, `:212`, `:224` |
| Support page hero, search, quick prompts | Hardcoded | `pages/cs/index.tsx:36-90` |
| Six topic cards with guide counts | Hardcoded | `pages/cs/index.tsx:102-237` |
| Eight FAQ questions and answers | Hardcoded long-form English; not loaded from the notices API that the admin panel manages | `pages/cs/index.tsx:249-388` |
| Contact section, concierge panel, closing CTA | Hardcoded | `pages/cs/index.tsx:401-499` |
| Mobile view | Stub text `CS PAGE MOBILE` | `pages/cs/index.tsx:21` |

One line states “Multilingual concierge team (DE, EN, FR, JP)” (`pages/cs/index.tsx:456`), which lists none of the two non-English languages the site offers. With 80 of the page's strings in English next to a translated form, this page is the clearest example of a parent that looks migrated because a child uses the hook.

### K. Chat — 90 hardcoded strings, 0 `t()` calls (P2)

Conversation list, thread header, connection states (Connected / Reconnecting / Offline), composer placeholder and hints, empty states, delete-chat dialog, member dossier labels, role labels (Traveler, Hotel Partner, Tour Partner) and send/load errors are all hardcoded (`ChatSidebar.tsx:67-97`, `ChatThread.tsx:78-274`, `ChatMessenger.tsx:119-283`, `ChatDossier.tsx:48-243`). Message times use `Intl.DateTimeFormat('en', …)` (`ChatSidebar.tsx:28`, `ChatThread.tsx:26`, `:30`). Message bodies are user content and stay as written.

### L. Member profile — 117 hardcoded strings, 0 `t()` calls (P2)

Header badges and stats, sidebar sections, articles/followers/following/products lists with their sort buttons, search placeholders, pagination text, empty states and alerts are hardcoded (`MemberHeader.tsx:44-165`, `MemberSidebar.tsx:39-138`, `MemberArticles.tsx`, `MemberFollowers.tsx`, `MemberFollowing.tsx`, `MemberProducts.tsx`). Several sentences are assembled from fragments around a member name (`MemberProducts.tsx:146-147`, `MemberFollowing.tsx:95`), which fixes English word order. Two placeholder values are presented as real data when the API value is missing: a default biography sentence (`MemberHeader.tsx:128`) and “May 2022” as the join date (`MemberSidebar.tsx:32`).

### M. My Page — 253 hardcoded strings, 0 `t()` calls (P2; bookings P0)

| Item | Evidence |
| --- | --- |
| Sidebar menu (Articles, Followers, Following, Wishlist, Bookings, Visited hotels, Visited tours, Notifications, Settings), partner block, **Log Out** and its confirmation, concierge promo | `MyProfileSidebar.tsx:82-334` |
| Header stats, “Become a Partner”, “Edit Profile”; raw `memberType` badge | `MyProfileHeader.tsx:60-154`, `:80` |
| Bookings: tabs, status filters, status chip (Cancelled / Confirmed / Completed — unused keys `booking.cancelled`, `booking.confirmed`, `booking.completed` exist), details dialog, cancel confirmation, calendar export; prices and dates pinned to `en-US`; raw `bookingStatus` in the dialog | `MyProfileBookings.tsx:57-384`, `:94-102`, `:260`, `:365` |
| Notifications: heading, filters, action buttons, pagination text; titles from the API; relative time unlocalized | `MyProfileNotifications.tsx:217-313`, `:273`, `:277` |
| Wishlist, visited hotels, visited tours | `MyProfileWishlist.tsx:118-241`; `MyProfileHistory.tsx:33-73`; `MyProfileVisitedTours.tsx:33-73` |
| Articles, followers, following | `MyProfileArticles.tsx:70-332`; `MyProfileFollowers.tsx:54-211`; `MyProfileFollowing.tsx:45-178` |
| Settings form labels, placeholders, upload states, result alerts | `MyProfileSettings.tsx:77-327` |
| Partner application: form, status banners, history, alerts; raw `agentType` | `AgentApplicationPage.tsx:65-316`, `:150`, `:303` |
| Tab titles | `pages/mypage/index.tsx:62-94` |

### N. Agent workspace — 132 hardcoded strings, 0 `t()` calls (P2)

Hotel and tour forms (every label, placeholder-less field heading, validation alert, save/submit state), the three management tables (headers, filters, empty and loading rows, pagination text) and reservation list are hardcoded (`AgentPropertyForm.tsx:93-277`, `AgentTourForm.tsx:82-259`, `MyHotels.tsx:54-181`, `MyTours.tsx:53-178`, `Reservations.tsx:83-201`). Status and type dropdowns iterate enum objects and print the raw values (`MyHotels.tsx:86`, `:97`; `MyTours.tsx:82`; `Reservations.tsx:105`; `AgentPropertyForm.tsx:181`). Two tooltips expose developer notes to the agent: “Text search not supported by backend yet” (`MyHotels.tsx:74`, `MyTours.tsx:73`).

### O. Admin panel — 571 hardcoded strings, 0 `t()` calls (P3)

All 13 admin routes, `LayoutAdmin.tsx` and `UserDrawer.tsx` are English only: sidebar, page headings, table headers, filters, status options, drawers, confirmation dialogs (`Swal.fire` titles, texts and button labels), toasts and CSV export headers. Raw enum values are rendered at 33 sites. Whether the admin panel should be translated at all is a product decision; it is counted separately in section 1 for that reason.

Not an i18n defect but visible while auditing: several admin drawers fall back to invented sample content when a field is empty, for example “Julian Laurent” (`pages/_admin/agent-verification/index.tsx:636`) and a full marketing paragraph (`pages/_admin/properties/index.tsx:612`). `AGENTS.md` §9.1 forbids this.

---

## 6. Dictionary audit

### 6.1 Structure

- `en.json`, `ko.json`, `uz.json` each contain **157** leaf keys; no key is missing or extra in any locale; interpolation placeholders match in all three.
- Every key referenced by a literal `t('…')` call exists. There are no missing-key fallbacks at runtime.
- Two call sites use computed keys, both resolvable: `CsContactForm.tsx:237` (`option.labelKey`, six `support.*` category keys) and `Hero.tsx` (`guestOption` / `guestOptionPlural`).
- The only values identical to English in `ko`/`uz` are the three language endonyms, which is correct.

### 6.2 Keys defined but never used (25)

| Key(s) | English value | Where the same text is hardcoded instead |
| --- | --- | --- |
| `payment.securePayment`, `priceSummary`, `totalDue`, `pay`, `processing` | Secure Payment, Price Summary, Total Due, Pay {{amount}}, Processing… | `pages/checkout/index.tsx:82`, `:277`, `:315`, `:334` |
| `booking.confirmed`, `cancelled`, `completed` | Confirmed, Cancelled, Completed | `MyProfileBookings.tsx:260` |
| `booking.pending` | Payment pending | not rendered anywhere |
| `booking.bookNow` | Book now | not rendered anywhere |
| `auth.logout` | Log out | `MyProfileSidebar.tsx:314` |
| `auth.signup` | Sign up | sign-up entry points say “Create an account” / “Create Account” (`SignIn.tsx:322`, `SignUp.tsx:387`) |
| `common.cancel`, `save`, `close` | Cancel, Save, Close | 20+ “Cancel”/“Save Changes”/“Close” buttons and ARIA labels (Appendix B) |
| `common.loading`, `error`, `retry`, `noResults`, `viewAll`, `search` | Loading…, Something went wrong., Try again, No results found., View all, Search | Per-page loading, error and empty states; `GlobalSearch.tsx:130` |
| `common.night`, `nights`, `travelers` | night, nights, travelers | `PropertyReservationWidget.tsx:171`; `TourReservationWidget.tsx:83` |
| `navigation.savedWishlist` | Saved wishlist | no wishlist control exists in the navbar |

These keys show that the vocabulary was prepared but the components were never connected.

### 6.3 English source strings

| Key | Issue |
| --- | --- |
| `home.hero.guests` | “{{count}} guests” renders “1 guests” |
| `home.trending.stays`, `home.trending.tours` | “1 stays”, “1 tours” |
| `home.dispatches.views` | “1 views” |
| `home.experiences.capacity` | “1 guests max” |
| `navigation.customerService` | “CS” is an internal abbreviation; Korean and Uzbek use full words |
| `common.traveler` | A lowercase unit noun used as image `alt` text in the hero |

### 6.4 Korean (`ko.json`)

No untranslated or mistranslated entries were found. Notes for a native reviewer:

| Key | Note |
| --- | --- |
| `support.ticketSubmitted` | “문의 #{{id}}가 접수되었습니다” attaches the particle 가 to an ID whose last character varies. When the ID ends in 0, 1, 3, 6, 7 or 8 the correct particle is 이. Rephrase so no particle follows the variable. |
| `home.dispatches.views` | Receives values such as “1.2k”, producing “조회 1.2k회”; depends on the compact-number fix in I-6 |
| `booking.bookNow`, `booking.reserve` | Both “예약하기”; fine unless the two actions must be distinguished |

### 6.5 Uzbek (`uz.json`)

No English leftovers. Points to confirm with a native reviewer; these are judgement calls, not confirmed errors:

| Key | Note |
| --- | --- |
| `home.hero.description` | “konseyjerning” — the usual Uzbek spelling is “konsyerj” |
| `booking.bookNow` vs `booking.reserve`; `home.hero.plan` vs `home.hero.planDescription` | “bron qilish” and “band qilish” are both used for the same action; choose one |
| `navigation.tours`, `home.community.tours`, `home.partners.tourPartner`, `support.tour` | “Sayohatlar” (travels) is used for tour products; “Turlar” is the common trade term. Decide and apply consistently. |
| `home.experiences.title`, `support.tour`, `home.hero.planDescription` | “tajriba” for a travel “experience” is a calque (its usual sense is know-how or experiment) |
| `home.experiences.from` | “Boshlab” as a stand-alone label above a price is unnatural; Uzbek places it after the amount (“… dan boshlab”) |
| `home.experiences.to` | “{{city}}ga” glues a case suffix to an API value; names ending in k, q or g need a different form (Bangkok → Bangkokka). Use a construction without a suffix. |
| Apostrophes | 50 × U+2018 (‘) for oʻ/gʻ and 7 × U+2019 (’) for the glottal stop. This is consistent internally. The standard recommends U+02BB and U+02BC; users type U+0027, which matters for in-page search. Low priority. |

---

## 7. What is confirmed localized

- Navbar links, notification and profile labels, language selector label (`Top.tsx`).
- Footer description, column headings, link labels, copyright with year interpolation (`Footer.tsx`).
- Home: hero copy and search bar labels, and the headings, descriptions, CTAs, loading, empty and unavailable states of all seven sections.
- Support contact form: field labels, category options, subject and message placeholders, upload hints, submit states, success and sign-in panels.
- `<html lang>` per locale; locale switching preserves pathname and query.
- Dictionary parity and interpolation placeholders across the three locales.

## 8. Intentionally not translated

| Category | Examples | Treatment in this audit |
| --- | --- | --- |
| Content written by members, agents and admins | Property, tour, destination and article names and bodies; comments; chat messages; member names and bios; notices | Excluded |
| Brand and proper nouns | AURORA, Kakao, Telegram, Stripe | Listed as `brand` in Appendix B, not counted |
| Currency | `USD ($)`, `$` amounts (fixed by `AGENTS.md` §9.2) | Not counted; number grouping still falls under I-6 |
| Language endonyms | English, 한국어, O‘zbekcha | Not counted |
| Technical values | Enum constants in variables and comparisons, routes, GraphQL fields, icon names, file types | Excluded by rule; enum values that are *rendered* are in Appendix C |
| Developer-only text | `console.log` output, the `useI18n` guard error | Excluded |

## 9. Suggested order of work

No change was made. If the migration proceeds, this order follows the dependencies found above:

1. Infrastructure first: a `t` usable outside components (I-5), plural handling (I-4), one locale-aware date/number/relative-time helper (I-6), enum-to-label maps (I-7), value/label separation in sort controls (I-8), server-side locale persistence (I-1 to I-3).
2. P0 flows: auth, booking widgets, checkout (wire the existing `payment.*` and `booking.*` keys), shared alerts, Stripe locale.
3. P1 public pages: hotels, tours, destinations, community, support page, global search, titles and meta.
4. P2 signed-in areas, then a decision on admin (P3).
5. Extend `i18n:check` so it fails on unused keys and on new JSX literals.

---

## Appendix A — Per-file metrics

`Label` combines label constants, data labels and export headers. Files with a total of 0 contain no hardcoded literals; they may still appear in Appendices C–F.

<details>
<summary>All files that render UI or hold UI strings</summary>

| File | Lines | `useI18n` | `t()` | Text | Attr | A11y | Meta | Alert | Label | Total |
| --- | ---: | :---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `libs/auth/social.ts` | 248 | — | 0 | 0 | 0 | 0 | 0 | 4 | 0 | **4** |
| `libs/components/AuroraLogo3D.tsx` | 681 | — | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** |
| `libs/components/Footer.tsx` | 113 | yes | 19 | 0 | 0 | 3 | 0 | 0 | 0 | **3** |
| `libs/components/Top.tsx` | 215 | yes | 13 | 0 | 0 | 4 | 0 | 0 | 0 | **4** |
| `libs/components/account/SignIn.tsx` | 366 | — | 0 | 19 | 1 | 6 | 0 | 6 | 3 | **35** |
| `libs/components/account/SignUp.tsx` | 523 | — | 0 | 24 | 2 | 5 | 0 | 11 | 0 | **42** |
| `libs/components/admin/UserDrawer.tsx` | 352 | — | 0 | 38 | 0 | 1 | 0 | 0 | 7 | **46** |
| `libs/components/chat/ChatDossier.tsx` | 255 | — | 0 | 31 | 0 | 4 | 0 | 1 | 2 | **38** |
| `libs/components/chat/ChatMessenger.tsx` | 289 | — | 0 | 6 | 0 | 0 | 0 | 5 | 0 | **11** |
| `libs/components/chat/ChatSidebar.tsx` | 104 | — | 0 | 7 | 1 | 2 | 0 | 0 | 5 | **15** |
| `libs/components/chat/ChatThread.tsx` | 282 | — | 0 | 11 | 1 | 2 | 0 | 3 | 6 | **23** |
| `libs/components/common/FollowButton.tsx` | 63 | — | 0 | 0 | 0 | 0 | 0 | 0 | 4 | **4** |
| `libs/components/common/GlobalSearch.tsx` | 173 | — | 0 | 3 | 1 | 1 | 0 | 0 | 3 | **8** |
| `libs/components/common/LikeButton.tsx` | 43 | — | 0 | 0 | 0 | 2 | 0 | 0 | 0 | **2** |
| `libs/components/community/CommunityCard.tsx` | 195 | — | 0 | 2 | 0 | 1 | 0 | 2 | 7 | **12** |
| `libs/components/community/CommunityFilter.tsx` | 49 | — | 0 | 0 | 0 | 1 | 0 | 0 | 6 | **7** |
| `libs/components/community/CommunityHeader.tsx` | 102 | — | 0 | 4 | 0 | 0 | 0 | 0 | 3 | **7** |
| `libs/components/community/CommunitySidebar.tsx` | 256 | — | 0 | 12 | 0 | 0 | 0 | 3 | 0 | **15** |
| `libs/components/community/WriteStoryModal.tsx` | 280 | — | 0 | 16 | 2 | 2 | 0 | 4 | 0 | **24** |
| `libs/components/community/detail/CommunityDetailBody.tsx` | 28 | — | 0 | 1 | 0 | 0 | 0 | 0 | 0 | **1** |
| `libs/components/community/detail/CommunityDetailBreadcrumb.tsx` | 42 | — | 0 | 2 | 0 | 1 | 0 | 0 | 0 | **3** |
| `libs/components/community/detail/CommunityDetailComments.tsx` | 318 | — | 0 | 12 | 1 | 4 | 0 | 1 | 6 | **24** |
| `libs/components/community/detail/CommunityDetailEngagementBar.tsx` | 92 | — | 0 | 2 | 0 | 1 | 0 | 2 | 0 | **5** |
| `libs/components/community/detail/CommunityDetailHeader.tsx` | 134 | — | 0 | 5 | 0 | 1 | 0 | 2 | 1 | **9** |
| `libs/components/community/detail/CommunityDetailMedia.tsx` | 28 | — | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** |
| `libs/components/community/detail/CommunityDetailRelated.tsx` | 111 | — | 0 | 3 | 0 | 0 | 0 | 0 | 7 | **10** |
| `libs/components/cs/CsContactForm.tsx` | 308 | yes | 21 | 0 | 2 | 0 | 0 | 5 | 1 | **8** |
| `libs/components/destination/DestinationCard.tsx` | 118 | — | 0 | 3 | 0 | 1 | 0 | 0 | 0 | **4** |
| `libs/components/destination/DestinationFilter.tsx` | 85 | — | 0 | 9 | 0 | 0 | 0 | 0 | 7 | **16** |
| `libs/components/destination/DestinationHero.tsx` | 35 | — | 0 | 3 | 0 | 0 | 0 | 0 | 0 | **3** |
| `libs/components/destination/detail/DestinationAbout.tsx` | 123 | — | 0 | 18 | 0 | 4 | 0 | 1 | 0 | **23** |
| `libs/components/destination/detail/DestinationCities.tsx` | 62 | — | 0 | 4 | 0 | 0 | 0 | 0 | 0 | **4** |
| `libs/components/destination/detail/DestinationContinueExploring.tsx` | 84 | — | 0 | 4 | 0 | 0 | 0 | 0 | 0 | **4** |
| `libs/components/destination/detail/DestinationDetailHero.tsx` | 90 | — | 0 | 2 | 0 | 5 | 0 | 0 | 0 | **7** |
| `libs/components/destination/detail/DestinationPopularTours.tsx` | 137 | — | 0 | 10 | 0 | 1 | 0 | 0 | 0 | **11** |
| `libs/components/destination/detail/DestinationReviews.tsx` | 282 | — | 0 | 12 | 1 | 4 | 0 | 0 | 6 | **23** |
| `libs/components/destination/detail/DestinationTopStays.tsx` | 130 | — | 0 | 8 | 0 | 1 | 0 | 0 | 0 | **9** |
| `libs/components/destination/detail/DestinationTravelers.tsx` | 27 | — | 0 | 6 | 0 | 0 | 0 | 2 | 0 | **8** |
| `libs/components/homepage/CommunityCurators.tsx` | 231 | yes | 10 | 0 | 0 | 0 | 0 | 1 | 0 | **1** |
| `libs/components/homepage/Experiences.tsx` | 118 | yes | 11 | 0 | 0 | 0 | 0 | 0 | 0 | **0** |
| `libs/components/homepage/Hero.tsx` | 389 | yes | 24 | 0 | 0 | 0 | 0 | 0 | 6 | **6** |
| `libs/components/homepage/LiveDispatches.tsx` | 76 | yes | 8 | 0 | 0 | 0 | 0 | 0 | 0 | **0** |
| `libs/components/homepage/SpecialStays.tsx` | 104 | yes | 11 | 0 | 0 | 0 | 0 | 1 | 0 | **1** |
| `libs/components/homepage/TravelPartners.tsx` | 27 | yes | 9 | 0 | 0 | 0 | 0 | 0 | 0 | **0** |
| `libs/components/homepage/TrendingDestinations.tsx` | 136 | yes | 9 | 0 | 0 | 0 | 0 | 0 | 0 | **0** |
| `libs/components/layout/LayoutAdmin.tsx` | 233 | — | 0 | 15 | 0 | 2 | 0 | 0 | 0 | **17** |
| `libs/components/layout/LayoutBasic.tsx` | 50 | — | 0 | 2 | 0 | 0 | 2 | 0 | 0 | **4** |
| `libs/components/layout/LayoutHome.tsx` | 50 | — | 0 | 2 | 0 | 0 | 2 | 0 | 0 | **4** |
| `libs/components/member/MemberArticles.tsx` | 254 | — | 0 | 13 | 0 | 3 | 0 | 2 | 2 | **20** |
| `libs/components/member/MemberFollowers.tsx` | 230 | — | 0 | 13 | 1 | 2 | 0 | 5 | 1 | **22** |
| `libs/components/member/MemberFollowing.tsx` | 231 | — | 0 | 14 | 1 | 2 | 0 | 5 | 1 | **23** |
| `libs/components/member/MemberHeader.tsx` | 176 | — | 0 | 7 | 0 | 3 | 0 | 5 | 0 | **15** |
| `libs/components/member/MemberProducts.tsx` | 197 | — | 0 | 9 | 0 | 0 | 0 | 4 | 4 | **17** |
| `libs/components/member/MemberSidebar.tsx` | 146 | — | 0 | 8 | 0 | 1 | 0 | 0 | 4 | **13** |
| `libs/components/mypage/AgentApplicationPage.tsx` | 332 | — | 0 | 40 | 4 | 0 | 0 | 3 | 0 | **47** |
| `libs/components/mypage/MyProfileArticles.tsx` | 351 | — | 0 | 14 | 0 | 1 | 0 | 3 | 1 | **19** |
| `libs/components/mypage/MyProfileBookings.tsx` | 395 | — | 0 | 34 | 0 | 0 | 0 | 4 | 6 | **44** |
| `libs/components/mypage/MyProfileFollowers.tsx` | 220 | — | 0 | 10 | 1 | 1 | 0 | 2 | 2 | **16** |
| `libs/components/mypage/MyProfileFollowing.tsx` | 187 | — | 0 | 10 | 1 | 1 | 0 | 2 | 2 | **16** |
| `libs/components/mypage/MyProfileHeader.tsx` | 166 | — | 0 | 6 | 0 | 0 | 0 | 0 | 2 | **8** |
| `libs/components/mypage/MyProfileHistory.tsx` | 81 | — | 0 | 8 | 0 | 0 | 0 | 0 | 1 | **9** |
| `libs/components/mypage/MyProfileNotifications.tsx` | 322 | — | 0 | 13 | 0 | 1 | 0 | 0 | 0 | **14** |
| `libs/components/mypage/MyProfileSettings.tsx` | 337 | — | 0 | 12 | 2 | 1 | 0 | 4 | 0 | **19** |
| `libs/components/mypage/MyProfileSidebar.tsx` | 342 | — | 0 | 9 | 0 | 0 | 0 | 1 | 11 | **21** |
| `libs/components/mypage/MyProfileVisitedTours.tsx` | 81 | — | 0 | 8 | 0 | 0 | 0 | 0 | 1 | **9** |
| `libs/components/mypage/MyProfileWishlist.tsx` | 253 | — | 0 | 9 | 3 | 0 | 0 | 1 | 2 | **15** |
| `libs/components/mypage/WishlistPlaceCard.tsx` | 197 | — | 0 | 1 | 0 | 1 | 0 | 0 | 0 | **2** |
| `libs/components/mypage/agent/AgentPropertyForm.tsx` | 287 | — | 0 | 22 | 0 | 5 | 0 | 7 | 0 | **34** |
| `libs/components/mypage/agent/AgentTourForm.tsx` | 269 | — | 0 | 23 | 0 | 3 | 0 | 9 | 0 | **35** |
| `libs/components/mypage/agent/MyHotels.tsx` | 211 | — | 0 | 18 | 1 | 2 | 0 | 0 | 0 | **21** |
| `libs/components/mypage/agent/MyTours.tsx` | 208 | — | 0 | 20 | 1 | 1 | 0 | 0 | 0 | **22** |
| `libs/components/mypage/agent/Reservations.tsx` | 228 | — | 0 | 18 | 1 | 1 | 0 | 0 | 0 | **20** |
| `libs/components/property/Filter.tsx` | 330 | — | 0 | 9 | 1 | 0 | 0 | 0 | 12 | **22** |
| `libs/components/property/PropertyCard.tsx` | 177 | — | 0 | 9 | 0 | 0 | 0 | 0 | 3 | **12** |
| `libs/components/property/PropertyHero.tsx` | 28 | — | 0 | 3 | 0 | 1 | 0 | 0 | 0 | **4** |
| `libs/components/property/detail/PropertyComments.tsx` | 267 | — | 0 | 15 | 1 | 1 | 0 | 3 | 1 | **21** |
| `libs/components/property/detail/PropertyGallery.tsx` | 88 | — | 0 | 4 | 0 | 4 | 0 | 0 | 1 | **9** |
| `libs/components/property/detail/PropertyHeader.tsx` | 99 | — | 0 | 6 | 0 | 1 | 0 | 1 | 0 | **8** |
| `libs/components/property/detail/PropertyOverview.tsx` | 179 | — | 0 | 31 | 0 | 1 | 0 | 1 | 1 | **34** |
| `libs/components/property/detail/PropertyReservationWidget.tsx` | 183 | — | 0 | 14 | 0 | 0 | 0 | 2 | 0 | **16** |
| `libs/components/property/detail/SimilarProperties.tsx` | 131 | — | 0 | 8 | 0 | 0 | 0 | 1 | 0 | **9** |
| `libs/components/tour/TourCard.tsx` | 72 | — | 0 | 5 | 0 | 0 | 0 | 0 | 0 | **5** |
| `libs/components/tour/TourFilter.tsx` | 279 | — | 0 | 14 | 1 | 0 | 0 | 0 | 2 | **17** |
| `libs/components/tour/TourHero.tsx` | 43 | — | 0 | 3 | 0 | 0 | 0 | 0 | 0 | **3** |
| `libs/components/tour/detail/SimilarTours.tsx` | 44 | — | 0 | 6 | 0 | 1 | 0 | 1 | 0 | **8** |
| `libs/components/tour/detail/TourComments.tsx` | 278 | — | 0 | 15 | 1 | 1 | 0 | 3 | 1 | **21** |
| `libs/components/tour/detail/TourGallery.tsx` | 31 | — | 0 | 4 | 0 | 4 | 0 | 0 | 1 | **9** |
| `libs/components/tour/detail/TourHeader.tsx` | 111 | — | 0 | 9 | 0 | 1 | 0 | 1 | 0 | **11** |
| `libs/components/tour/detail/TourOverview.tsx` | 116 | — | 0 | 23 | 0 | 1 | 0 | 1 | 1 | **26** |
| `libs/components/tour/detail/TourReservationWidget.tsx` | 92 | — | 0 | 14 | 0 | 0 | 0 | 2 | 0 | **16** |
| `libs/config.ts` | 54 | — | 0 | 0 | 0 | 0 | 0 | 4 | 13 | **17** |
| `libs/enums/common.enum.ts` | 16 | — | 0 | 0 | 0 | 0 | 0 | 2 | 0 | **2** |
| `libs/enums/notice.enum.ts` | 12 | — | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** |
| `libs/sweetAlert.ts` | 121 | — | 0 | 0 | 0 | 0 | 0 | 0 | 2 | **2** |
| `libs/utils.ts` | 30 | — | 0 | 0 | 0 | 0 | 0 | 0 | 2 | **2** |
| `pages/_admin/agent-verification/index.tsx` | 836 | — | 0 | 54 | 0 | 3 | 0 | 2 | 11 | **70** |
| `pages/_admin/bookings/index.tsx` | 118 | — | 0 | 18 | 0 | 0 | 0 | 0 | 1 | **19** |
| `pages/_admin/community/index.tsx` | 544 | — | 0 | 35 | 0 | 0 | 0 | 4 | 7 | **46** |
| `pages/_admin/cs/index.tsx` | 567 | — | 0 | 37 | 3 | 0 | 0 | 6 | 4 | **50** |
| `pages/_admin/destinations/index.tsx` | 507 | — | 0 | 29 | 1 | 0 | 0 | 4 | 6 | **40** |
| `pages/_admin/index.tsx` | 342 | — | 0 | 26 | 1 | 1 | 0 | 0 | 0 | **28** |
| `pages/_admin/notifications/index.tsx` | 198 | — | 0 | 22 | 0 | 1 | 0 | 0 | 0 | **23** |
| `pages/_admin/properties/index.tsx` | 661 | — | 0 | 50 | 1 | 2 | 0 | 6 | 24 | **83** |
| `pages/_admin/reviews/index.tsx` | 165 | — | 0 | 18 | 1 | 0 | 0 | 2 | 0 | **21** |
| `pages/_admin/settings/index.tsx` | 36 | — | 0 | 5 | 0 | 0 | 0 | 1 | 0 | **6** |
| `pages/_admin/support/index.tsx` | 520 | — | 0 | 29 | 2 | 1 | 0 | 3 | 6 | **41** |
| `pages/_admin/tours/index.tsx` | 466 | — | 0 | 31 | 1 | 0 | 0 | 4 | 7 | **43** |
| `pages/_admin/users/index.tsx` | 555 | — | 0 | 27 | 1 | 0 | 0 | 2 | 8 | **38** |
| `pages/account/join.tsx` | 66 | — | 0 | 2 | 0 | 0 | 1 | 0 | 0 | **3** |
| `pages/account/login.tsx` | 26 | — | 0 | 1 | 0 | 0 | 1 | 0 | 0 | **2** |
| `pages/account/signup.tsx` | 26 | — | 0 | 1 | 0 | 0 | 1 | 0 | 0 | **2** |
| `pages/auth/kakao/callback.tsx` | 57 | — | 0 | 1 | 0 | 0 | 0 | 4 | 1 | **6** |
| `pages/auth/telegram/callback.tsx` | 92 | — | 0 | 2 | 0 | 0 | 0 | 7 | 2 | **11** |
| `pages/chat/index.tsx` | 40 | — | 0 | 1 | 0 | 0 | 1 | 1 | 0 | **3** |
| `pages/checkout/index.tsx` | 356 | — | 0 | 22 | 0 | 1 | 0 | 7 | 0 | **30** |
| `pages/community/detail.tsx` | 239 | — | 0 | 7 | 0 | 0 | 1 | 5 | 6 | **19** |
| `pages/community/index.tsx` | 484 | — | 0 | 11 | 0 | 0 | 1 | 2 | 0 | **14** |
| `pages/cs/index.tsx` | 511 | — | 0 | 80 | 1 | 0 | 0 | 0 | 0 | **81** |
| `pages/destination/detail.tsx` | 308 | — | 0 | 2 | 0 | 0 | 2 | 0 | 0 | **4** |
| `pages/destination/index.tsx` | 278 | — | 0 | 7 | 0 | 2 | 1 | 0 | 0 | **10** |
| `pages/index.tsx` | 117 | — | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **0** |
| `pages/member/index.tsx` | 138 | — | 0 | 5 | 0 | 0 | 1 | 0 | 1 | **7** |
| `pages/mypage/index.tsx` | 134 | — | 0 | 0 | 0 | 0 | 1 | 0 | 13 | **14** |
| `pages/property/detail.tsx` | 149 | — | 0 | 4 | 0 | 0 | 1 | 1 | 0 | **6** |
| `pages/property/index.tsx` | 353 | — | 0 | 13 | 0 | 0 | 0 | 0 | 5 | **18** |
| `pages/tour/detail.tsx` | 144 | — | 0 | 4 | 0 | 0 | 1 | 1 | 0 | **6** |
| `pages/tour/index.tsx` | 292 | — | 0 | 16 | 0 | 0 | 1 | 0 | 0 | **17** |

</details>

## Appendix B — Complete inventory of hardcoded strings

2,021 occurrences, grouped by area and file. **Kind**: `text` rendered text; `attr` placeholder or label attribute; `a11y` ARIA label, `alt`, `title`; `meta` meta content; `alert` alert, toast or inline error; `label` label constant, lookup map or fallback; `data` value that is both API data and label; `export` CSV header; `brand` not counted. **Where** is the enclosing JSX tag or the syntactic context. `${…}` marks an interpolated expression.


### Global shell

<details>
<summary><code>libs/components/AuroraLogo3D.tsx</code> — 0 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 670 | brand | attr:aria-label | AURORA |

</details>

<details>
<summary><code>libs/components/common/FollowButton.tsx</code> — 4 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 35 | label | return: | Updating... |
| 36 | label | return: | Unfollow |
| 37 | label | return: | Following |
| 38 | label | return: | Follow |

</details>

<details>
<summary><code>libs/components/common/GlobalSearch.tsx</code> — 8 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 48 | label | prop:group | Destinations |
| 55 | label | prop:group | Properties |
| 62 | label | prop:group | Tours |
| 130 | attr | attr:placeholder | Search… |
| 132 | a11y | attr:aria-label | Search AURORA |
| 140 | text | &lt;p&gt; | Searching… |
| 141 | text | &lt;p&gt; | Search is unavailable. Please try again. |
| 142 | text | &lt;p&gt; | No matching destinations, stays, or tours. |

</details>

<details>
<summary><code>libs/components/common/LikeButton.tsx</code> — 2 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 28 | a11y | attr:aria-label | Unlike |
| 28 | a11y | attr:aria-label | Like |

</details>

<details>
<summary><code>libs/components/Footer.tsx</code> — 3 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 37 | brand | &lt;span&gt; | USD ($) |
| 96 | a11y | attr:aria-label | Instagram Link |
| 99 | a11y | attr:aria-label | Social Updates Link |
| 102 | a11y | attr:aria-label | Video Channel Link |

</details>

<details>
<summary><code>libs/components/layout/LayoutBasic.tsx</code> — 4 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 17 | text | &lt;title&gt; | AURA Hotels &amp; Sanctuaries |
| 18 | meta | attr:content | AURA Hotels |
| 33 | text | &lt;title&gt; | AURA Hotels &amp; Sanctuaries |
| 34 | meta | attr:content | AURA Hotels |

</details>

<details>
<summary><code>libs/components/layout/LayoutHome.tsx</code> — 4 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 17 | text | &lt;title&gt; | AURA Travel — Go Somewhere Extraordinary |
| 18 | meta | attr:content | AURA Travel |
| 33 | text | &lt;title&gt; | AURA Travel — Go Somewhere Extraordinary |
| 34 | meta | attr:content | AURA Travel |

</details>

<details>
<summary><code>libs/components/Top.tsx</code> — 4 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 17 | brand | prop:short | EN |
| 17 | brand | prop:full | English |
| 17 | a11y | prop:alt | USA flag |
| 18 | brand | prop:full | 한국어 |
| 18 | a11y | prop:alt | Korea flag |
| 22 | brand | prop:full | O‘zbekcha |
| 23 | a11y | prop:alt | Uzbekistan flag |
| 159 | a11y | attr:alt | Language flag |
| 163 | brand | jsx-child | EN |
| 183 | brand | &lt;option&gt; | English |
| 184 | brand | &lt;option&gt; | 한국어 |
| 185 | brand | &lt;option&gt; | O‘zbekcha |

</details>

### Shared libraries

<details>
<summary><code>libs/auth/social.ts</code> — 4 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 126 | alert | return: | Google sign-in is not configured. |
| 127 | alert | return: | Google ${action} could not be completed. Please try again. |
| 245 | alert | return: | Telegram sign-in is not configured. |
| 246 | alert | return: | Telegram sign-in could not be started. Please try again. |

</details>

<details>
<summary><code>libs/config.ts</code> — 17 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 11 | brand | var:PROPERTY_AMENITY_OPTIONS | WiFi |
| 12 | data | var:PROPERTY_AMENITY_OPTIONS | Air Conditioning |
| 13 | data | var:PROPERTY_AMENITY_OPTIONS | Parking |
| 14 | data | var:PROPERTY_AMENITY_OPTIONS | Heating |
| 15 | data | var:PROPERTY_AMENITY_OPTIONS | Breakfast |
| 16 | data | var:PROPERTY_AMENITY_OPTIONS | Elevator |
| 17 | data | var:PROPERTY_AMENITY_OPTIONS | Kitchen |
| 18 | data | var:PROPERTY_AMENITY_OPTIONS | Washing Machine |
| 19 | data | var:PROPERTY_AMENITY_OPTIONS | Ocean View |
| 20 | data | var:PROPERTY_AMENITY_OPTIONS | Gym |
| 21 | data | var:PROPERTY_AMENITY_OPTIONS | Pool |
| 22 | data | var:PROPERTY_AMENITY_OPTIONS | Room Service |
| 23 | data | var:PROPERTY_AMENITY_OPTIONS | Luggage Storage |
| 24 | brand | var:PROPERTY_AMENITY_OPTIONS | TV |
| 25 | data | var:PROPERTY_AMENITY_OPTIONS | Private Garden |
| 41 | alert | prop:error1 | Something went wrong! |
| 42 | alert | prop:error2 | Please login first! |
| 43 | alert | prop:error3 | Please fulfill all inputs! |
| 44 | alert | prop:error4 | Message is empty! |

</details>

<details>
<summary><code>libs/enums/common.enum.ts</code> — 2 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 12 | alert | Message.NOT_AUTHENTICATED | Please login first! |
| 13 | alert | Message.SESSION_EXPIRED | Your session has expired, please login again! |

</details>

<details>
<summary><code>libs/enums/notice.enum.ts</code> — 0 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 2 | brand | NoticeCategory.FAQ | FAQ |

</details>

<details>
<summary><code>libs/sweetAlert.ts</code> — 2 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 71 | label | prop:confirmButtonText | Login |
| 116 | label | prop:confirmButtonText | OK |

</details>

<details>
<summary><code>libs/utils.ts</code> — 2 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 20 | label | return: | Date unavailable |
| 26 | label | return: | Duration unavailable |

</details>

### Home

<details>
<summary><code>libs/components/homepage/CommunityCurators.tsx</code> — 1 string</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 105 | alert | var:errorMessage | Unable to update follow status. |

</details>

<details>
<summary><code>libs/components/homepage/Hero.tsx</code> — 6 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 48 | label | var:locationOptions | Seoul |
| 49 | label | var:locationOptions | Tokyo |
| 50 | label | var:locationOptions | Paris |
| 51 | label | var:locationOptions | Osaka |
| 52 | label | var:locationOptions | Bangkok |
| 53 | label | var:locationOptions | Fukuoka |

</details>

<details>
<summary><code>libs/components/homepage/SpecialStays.tsx</code> — 1 string</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 42 | alert | var:errorMessage | Unable to update favorite status. |

</details>

### Auth

<details>
<summary><code>libs/components/account/SignIn.tsx</code> — 35 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 50 | label | call:setIdentifierHint | Valid Email |
| 52 | label | call:setIdentifierHint | Valid Handle |
| 54 | label | call:setIdentifierHint | Valid Nickname |
| 63 | alert | call:sweetMixinErrorAlert | Please enter your email/nickname and password. |
| 80 | alert | call:sweetTopSmallSuccessAlert | Welcome back, ${data.login.memberNick}! |
| 85 | alert | call:sweetMixinErrorAlert | Login failed. Please check your credentials. |
| 98 | alert | call:sweetTopSmallSuccessAlert | Welcome, ${member.memberNick}! |
| 129 | alert | call:sweetMixinErrorAlert | Kakao sign-in is not configured. |
| 152 | text | &lt;span&gt; | Account Access |
| 154 | text | &lt;span&gt; | Auth Portal v2.4 |
| 161 | text | &lt;span&gt; | Welcome Back |
| 162 | text | &lt;h1&gt; | Sign in to your account |
| 163 | text | &lt;p&gt; | Sign in to continue your curated journey with AURA. |
| 171 | text | &lt;label&gt; | Email or Nickname |
| 186 | attr | attr:placeholder | name@example.com or @handle |
| 196 | text | &lt;label&gt; | Password |
| 202 | alert | attr:onClick &gt; call:sweetMixinErrorAlert | Password recovery link has been sent to your registered email. |
| 205 | text | &lt;a&gt; | Forgot password? |
| 223 | a11y | attr:aria-label | Toggle password visibility |
| 240 | text | &lt;span&gt; | Remember this device |
| 244 | text | &lt;span&gt; | 256-bit SSL |
| 252 | text | &lt;span&gt; | Authenticating... |
| 257 | text | &lt;span&gt; | Sign In |
| 266 | text | &lt;span&gt; | or continue with |
| 274 | a11y | attr:aria-label | Continue with Google |
| 285 | a11y | attr:title | Continue with Kakao |
| 292 | brand | &lt;span&gt; | Kakao |
| 299 | a11y | attr:title | Continue with Telegram |
| 306 | brand | &lt;span&gt; | Telegram |
| 314 | text | &lt;p&gt; | New to AURA? |
| 322 | text | &lt;button&gt; | Create an account |
| 331 | a11y | attr:alt | Swiss Alps sanctuary luxury retreat |
| 342 | text | &lt;span&gt; | Swiss Alps · Sanctuary Collection |
| 344 | a11y | attr:aria-label | Explore sanctuary |
| 351 | text | &lt;span&gt; | Editorial Feature |
| 352 | text | &lt;h2&gt; | Your next journey starts here. |
| 353 | text | &lt;p&gt; | Curated stays, bespoke expeditions, and private alpine retreats across the world. |

</details>

<details>
<summary><code>libs/components/account/SignUp.tsx</code> — 42 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 62 | alert | call:sweetMixinErrorAlert | Please enter a username. |
| 67 | alert | call:sweetMixinErrorAlert | Username must be at least 3 characters long. |
| 72 | alert | call:sweetMixinErrorAlert | Password must be at least 5 characters long. |
| 77 | alert | call:sweetMixinErrorAlert | Passwords do not match. |
| 83 | alert | call:sweetMixinErrorAlert | Please agree to the Terms of Service and Privacy Policy. |
| 104 | alert | call:sweetTopSmallSuccessAlert | Welcome to AURA, ${data.signup.memberNick}! |
| 114 | alert | call:sweetMixinErrorAlert | Registration failed. Please check your information. |
| 129 | alert | call:sweetTopSmallSuccessAlert | Welcome to AURA, ${member.memberNick}! |
| 160 | alert | call:sweetMixinErrorAlert | Kakao sign-up is not configured. |
| 195 | text | &lt;span&gt; | CREATE ACCOUNT |
| 198 | text | &lt;span&gt; | JOIN AURA V2.4 |
| 203 | text | &lt;span&gt; | GET STARTED |
| 205 | text | &lt;h1&gt; | Create your AURA account |
| 207 | text | &lt;p&gt; | Join a world of extraordinary travel experiences. |
| 215 | text | &lt;label&gt; | Username * |
| 230 | attr | attr:placeholder | e.g. kevin7 |
| 239 | text | &lt;label&gt; | Full Name |
| 253 | attr | attr:placeholder | e.g. Kevin Kazakov |
| 263 | text | &lt;label&gt; | Password * |
| 286 | a11y | attr:aria-label | Toggle password visibility |
| 297 | text | &lt;label&gt; | Confirm Password * |
| 320 | a11y | attr:aria-label | Toggle confirm password visibility |
| 334 | text | &lt;span&gt; | Use at least 5 characters for your password. |
| 347 | text | &lt;span&gt; | I agree to the |
| 354 | alert | attr:onClick &gt; call:sweetMixinErrorAlert | Terms of Service: Standard user agreement applies. |
| 358 | text | &lt;a&gt; | Terms of Service |
| 360 | text | &lt;span&gt; | and |
| 367 | alert | attr:onClick &gt; call:sweetMixinErrorAlert | Privacy Policy: Your personal data is protected. |
| 371 | text | &lt;a&gt; | Privacy Policy |
| 382 | text | &lt;span&gt; | Creating Account... |
| 387 | text | &lt;span&gt; | Create Account |
| 398 | text | &lt;span&gt; | or continue with |
| 406 | a11y | attr:aria-label | Continue with Google |
| 423 | brand | &lt;span&gt; | Kakao |
| 436 | brand | &lt;span&gt; | Telegram |
| 451 | text | &lt;span&gt; | Phone |
| 459 | text | &lt;p&gt; | Already have an account? |
| 471 | text | &lt;button&gt; | Sign In |
| 481 | a11y | attr:alt | Swiss Alps sanctuary luxury retreat |
| 492 | text | &lt;span&gt; | Swiss Alps · Sanctuary Collection |
| 497 | a11y | attr:aria-label | Explore sanctuary |
| 505 | text | &lt;span&gt; | Editorial Feature |
| 506 | text | &lt;h2&gt; | Your next journey starts here. |
| 508 | text | &lt;p&gt; | Curated stays, bespoke expeditions, and private alpine retreats across the world. |

</details>

<details>
<summary><code>pages/account/join.tsx</code> — 3 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 45 | text | jsx-child | AURA Travel — Sign In |
| 46 | text | jsx-child | AURA Travel — Sign Up |
| 50 | meta | attr:content | Sign in or register for your AURA Travel luxury exploration account. |

</details>

<details>
<summary><code>pages/account/login.tsx</code> — 2 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 14 | text | &lt;title&gt; | AURA Travel — Sign In |
| 15 | meta | attr:content | Sign in to your AURA Travel account. |

</details>

<details>
<summary><code>pages/account/signup.tsx</code> — 2 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 14 | text | &lt;title&gt; | AURA Travel — Sign Up |
| 15 | meta | attr:content | Create your AURA Travel luxury exploration account. |

</details>

<details>
<summary><code>pages/auth/kakao/callback.tsx</code> — 6 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 12 | label | call:useState | Completing Kakao sign-in… |
| 25 | alert | call:setMessage | Kakao sign-in was cancelled. |
| 25 | alert | call:setMessage | Kakao sign-in could not be completed. |
| 29 | alert | call:setMessage | This Kakao sign-in request is invalid or has expired. |
| 43 | alert | call:setMessage | Kakao sign-in could not be completed. Please return and try again. |
| 50 | text | &lt;title&gt; | Kakao sign-in — AURORA |

</details>

<details>
<summary><code>pages/auth/telegram/callback.tsx</code> — 11 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 13 | alert | var:TELEGRAM_USER_MESSAGES | Telegram authentication is not configured! |
| 14 | alert | var:TELEGRAM_USER_MESSAGES | Telegram authorization code, redirect URI, or PKCE verifier is invalid or expired. |
| 15 | alert | var:TELEGRAM_USER_MESSAGES | Telegram authentication is temporarily unavailable. Please try again. |
| 16 | alert | var:TELEGRAM_USER_MESSAGES | Telegram authentication failed. Please try again. |
| 22 | label | return: | Telegram sign-in could not be completed. Please return and try again. |
| 27 | label | call:useState | Completing Telegram sign-in… |
| 48 | alert | call:fail | Telegram sign-in was cancelled. |
| 48 | alert | call:fail | Telegram sign-in could not be completed. |
| 52 | alert | call:fail | This Telegram sign-in request is invalid or has expired. Please start again. |
| 77 | text | &lt;title&gt; | Telegram sign-in — AURORA |
| 83 | text | &lt;Link&gt; | Back to sign in |

</details>

### Hotels

<details>
<summary><code>libs/components/property/detail/PropertyComments.tsx</code> — 21 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 68 | alert | call:sweetErrorAlert | Please enter a comment before submitting. |
| 72 | alert | call:sweetErrorAlert | Comment must not exceed 500 characters. |
| 93 | alert | call:sweetErrorAlert | Failed to post comment. |
| 109 | text | &lt;h2&gt; | Guest Comments |
| 112 | text | &lt;p&gt; | evaluation |
| 112 | text | &lt;p&gt; | for |
| 119 | text | &lt;span&gt; | Sort by: |
| 126 | text | &lt;option&gt; | Most Recent |
| 127 | text | &lt;option&gt; | Recently Updated |
| 141 | text | &lt;p&gt; | Loading evaluations... |
| 148 | label | jsx-child &gt; var:authorName | Guest |
| 166 | text | &lt;p&gt; | Posted |
| 179 | text | &lt;p&gt; | No evaluations posted yet |
| 181 | text | &lt;p&gt; | Be the first to share your experience at |
| 223 | text | &lt;h3&gt; | Leave a Comment |
| 225 | text | &lt;p&gt; | Share your verified sanctuary experience with future voyagers |
| 233 | a11y | attr:alt | Current user |
| 240 | attr | attr:placeholder | Share your experience (e.g. scenic views, check-in, breakfast quality, spa temperatures)... |
| 246 | text | &lt;span&gt; | / 500 characters |
| 255 | text | jsx-child | Posting... |
| 255 | text | jsx-child | Post Comment |

</details>

<details>
<summary><code>libs/components/property/detail/PropertyGallery.tsx</code> — 9 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 14 | label | prop:title | ${property.propertyName} · Photo ${index + 1} |
| 34 | text | &lt;p&gt; | Photos for this hotel are not available yet. |
| 56 | text | &lt;p&gt; | Photo |
| 63 | text | &lt;span&gt; | View all |
| 63 | text | &lt;span&gt; | photo |
| 68 | a11y | attr:aria-label | Hotel photos |
| 70 | a11y | attr:aria-label | Close photos |
| 71 | a11y | attr:aria-label | Previous photo |
| 79 | a11y | attr:aria-label | Next photo |

</details>

<details>
<summary><code>libs/components/property/detail/PropertyHeader.tsx</code> — 8 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 20 | alert | call:sweetTopSmallSuccessAlert | Link copied to clipboard! |
| 30 | a11y | attr:aria-label | Breadcrumb |
| 32 | text | &lt;Link&gt; | Home |
| 36 | text | &lt;Link&gt; | Hotels |
| 61 | text | &lt;span&gt; | reviews) |
| 77 | text | &lt;span&gt; | Share |
| 90 | text | jsx-child | Liked |
| 90 | text | jsx-child | Like |

</details>

<details>
<summary><code>libs/components/property/detail/PropertyOverview.tsx</code> — 34 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 48 | label | var:hostName | Host |
| 74 | alert | call:sweetErrorAlert | Unable to update follow status. |
| 94 | text | &lt;p&gt; | Hotel details |
| 98 | text | &lt;span&gt; | Capacity |
| 98 | text | &lt;span&gt; | Guests |
| 99 | text | &lt;span&gt; | Bedrooms |
| 99 | text | &lt;span&gt; | Bedrooms |
| 100 | text | &lt;span&gt; | Beds |
| 100 | text | &lt;span&gt; | Beds |
| 101 | text | &lt;span&gt; | Bathrooms |
| 101 | text | &lt;span&gt; | Baths |
| 102 | text | &lt;span&gt; | Saved by |
| 102 | text | &lt;span&gt; | traveler |
| 103 | text | &lt;span&gt; | Views |
| 104 | text | &lt;span&gt; | Bookings |
| 109 | text | &lt;h3&gt; | About this hotel |
| 113 | text | jsx-child | Show less |
| 113 | text | jsx-child | Read more |
| 115 | text | &lt;p&gt; | The host has not added a description yet. |
| 119 | text | &lt;h3&gt; | Amenities |
| 119 | text | &lt;span&gt; | included |
| 125 | text | &lt;p&gt; | Amenities have not been listed yet. |
| 131 | text | &lt;h3&gt; | Location |
| 132 | text | jsx-child | Location details are not available yet. |
| 137 | a11y | attr:title | ${property.propertyName} location map |
| 140 | text | &lt;a&gt; | Open map |
| 143 | text | &lt;p&gt; | Map coordinates are not available for this destination yet. |
| 151 | text | &lt;span&gt; | Agent |
| 152 | text | jsx-child | Verified accommodation agent |
| 152 | text | jsx-child | Property host |
| 155 | text | &lt;span&gt; | Followers |
| 157 | text | &lt;span&gt; | Hotels |
| 162 | text | &lt;Link&gt; | View profile |
| 163 | text | &lt;button&gt; | Message |

</details>

<details>
<summary><code>libs/components/property/detail/PropertyReservationWidget.tsx</code> — 16 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 103 | alert | call:sweetErrorAlert | Please choose valid booking dates and guest count. |
| 109 | alert | call:sweetErrorAlert | Unable to open secure checkout. Please try again. |
| 125 | text | &lt;span&gt; | / night |
| 137 | text | &lt;label&gt; | Check-In |
| 141 | text | &lt;label&gt; | Check-Out |
| 148 | text | &lt;label&gt; | Guests |
| 148 | text | jsx-child | Guest |
| 148 | text | jsx-child | Guests |
| 155 | text | jsx-child | Guest |
| 155 | text | jsx-child | Guests |
| 166 | text | jsx-child | Preparing secure payment... |
| 166 | text | jsx-child | Reserve hotel |
| 166 | text | jsx-child | Unavailable |
| 168 | text | &lt;p&gt; | A secure Stripe payment form opens before any charge is confirmed. |
| 171 | text | &lt;span&gt; | night |
| 173 | text | &lt;span&gt; | Total |

</details>

<details>
<summary><code>libs/components/property/detail/SimilarProperties.tsx</code> — 9 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 50 | alert | call:sweetErrorAlert | Error occurred |
| 58 | text | &lt;h2&gt; | Similar Hotels |
| 59 | text | jsx-child | More stays in ${city} |
| 59 | text | jsx-child | More available stays |
| 62 | text | &lt;span&gt; | View All Hotels |
| 80 | text | &lt;div&gt; | No image available |
| 99 | text | &lt;span&gt; | Guests · |
| 99 | text | &lt;span&gt; | Bedrooms |
| 119 | text | &lt;span&gt; | / night |

</details>

<details>
<summary><code>libs/components/property/Filter.tsx</code> — 22 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 17 | label | prop:label | Hotel |
| 18 | label | prop:label | Resort |
| 19 | label | prop:label | Villa |
| 20 | label | prop:label | Apartment |
| 21 | label | prop:label | Guesthouse |
| 22 | label | prop:label | Motel |
| 23 | label | prop:label | Hostel |
| 24 | label | prop:label | Other |
| 28 | label | prop:label | 1+ Guests |
| 29 | label | prop:label | 2+ Guests |
| 30 | label | prop:label | 4+ Guests |
| 31 | label | prop:label | 5+ Guests |
| 201 | text | &lt;span&gt; | Filters |
| 204 | text | &lt;button&gt; | Clear All |
| 210 | text | &lt;label&gt; | Destination |
| 216 | attr | attr:placeholder | Search country or city... |
| 238 | text | &lt;label&gt; | Price per night |
| 239 | brand | &lt;span&gt; | USD ($) |
| 254 | text | &lt;span&gt; | Min |
| 259 | text | &lt;span&gt; | Max |
| 271 | text | &lt;label&gt; | Property Type |
| 291 | text | &lt;label&gt; | Amenities |
| 311 | text | &lt;label&gt; | Guest Capacity |

</details>

<details>
<summary><code>libs/components/property/PropertyCard.tsx</code> — 12 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 24 | label | prop:label | Top Rated |
| 26 | label | prop:label | Popular |
| 34 | label | prop:label | New |
| 113 | text | &lt;span&gt; | New |
| 120 | text | &lt;span&gt; | Up to |
| 120 | text | &lt;span&gt; | guests |
| 123 | text | &lt;span&gt; | bedrooms · |
| 123 | text | &lt;span&gt; | beds |
| 151 | text | &lt;span&gt; | From |
| 155 | text | &lt;span&gt; | / night |
| 157 | text | &lt;span&gt; | taxes included |
| 167 | text | &lt;button&gt; | Reserve |

</details>

<details>
<summary><code>libs/components/property/PropertyHero.tsx</code> — 4 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 7 | a11y | attr:alt | Aura Luxury Sanctuary Resort at dusk |
| 15 | text | &lt;span&gt; | CURATED SANCTUARIES &amp; RESORTS |
| 17 | text | &lt;h1&gt; | Find Your Perfect Stay |
| 19 | text | &lt;p&gt; | Exceptional places for every journey. From cliffside Mediterranean villas to secluded alpine chalets, engineered for pure stillness. |

</details>

<details>
<summary><code>pages/property/detail.tsx</code> — 6 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 51 | alert | call:sweetErrorAlert | Error occurred |
| 80 | text | &lt;span&gt; | Loading sanctuary details... |
| 92 | text | &lt;h1&gt; | Hotel unavailable |
| 93 | text | &lt;p&gt; | This hotel could not be found or is no longer available. |
| 103 | text | &lt;title&gt; | \| AURA Luxury Sanctuary |
| 106 | meta | attr:content | Curated luxury architectural sanctuary by AURA. |

</details>

<details>
<summary><code>pages/property/index.tsx</code> — 18 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 28 | label | prop:label | All Stays |
| 29 | label | prop:label | Villas |
| 30 | label | prop:label | Resorts |
| 31 | label | prop:label | Hotels |
| 32 | label | prop:label | Apartments |
| 245 | text | &lt;h2&gt; | Explore Hotels |
| 247 | text | &lt;span&gt; | stays available |
| 253 | text | &lt;span&gt; | SORT BY |
| 260 | text | &lt;option&gt; | Recommended |
| 262 | text | &lt;option&gt; | Price: Low to High |
| 265 | text | &lt;option&gt; | Price: High to Low |
| 267 | text | &lt;option&gt; | Top Rated |
| 268 | text | &lt;option&gt; | Newest |
| 300 | text | &lt;h3&gt; | No Stays Found |
| 302 | text | &lt;p&gt; | Try adjusting your search filters or destination criteria. |
| 339 | text | &lt;Typography&gt; | Total |
| 339 | text | &lt;Typography&gt; | propert |
| 339 | text | &lt;Typography&gt; | available |

</details>

### Tours

<details>
<summary><code>libs/components/tour/detail/SimilarTours.tsx</code> — 8 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 36 | alert | call:sweetErrorAlert | Unable to update favorite. |
| 40 | text | &lt;h2&gt; | Similar tours |
| 40 | text | &lt;p&gt; | More tours from the current results. |
| 40 | text | &lt;span&gt; | View all tours |
| 40 | text | &lt;div&gt; | No image available |
| 40 | a11y | attr:aria-label | Save tour |
| 40 | text | &lt;span&gt; | seats |
| 40 | text | &lt;span&gt; | / traveler |

</details>

<details>
<summary><code>libs/components/tour/detail/TourComments.tsx</code> — 21 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 65 | alert | call:sweetErrorAlert | Please enter your evaluation before submitting. |
| 69 | alert | call:sweetErrorAlert | Comment must not exceed 500 characters. |
| 90 | alert | call:sweetErrorAlert | Failed to post comment. |
| 104 | text | &lt;h2&gt; | Traveler Comments |
| 107 | text | &lt;p&gt; | evaluation |
| 107 | text | &lt;p&gt; | for |
| 114 | text | &lt;span&gt; | Sort by: |
| 121 | text | &lt;option&gt; | Most Recent |
| 122 | text | &lt;option&gt; | Detailed Feedback |
| 136 | text | &lt;p&gt; | Loading evaluations... |
| 143 | label | jsx-child &gt; var:authorName | Traveler |
| 166 | text | &lt;p&gt; | Posted |
| 190 | text | &lt;p&gt; | No evaluations posted yet |
| 192 | text | &lt;p&gt; | Be the first to share your experience with |
| 234 | text | &lt;h3&gt; | Leave a Comment |
| 236 | text | &lt;p&gt; | Share your verified sanctuary experience with future voyagers |
| 244 | a11y | attr:alt | Current user |
| 251 | attr | attr:placeholder | Share your experience (e.g. scenic views, check-in, breakfast quality, spa temperatures)... |
| 257 | text | &lt;span&gt; | / 500 characters |
| 266 | text | jsx-child | Posting... |
| 266 | text | jsx-child | Post Comment |

</details>

<details>
<summary><code>libs/components/tour/detail/TourGallery.tsx</code> — 9 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 9 | label | prop:title | ${tour.tourName} · Photo ${index + 1} |
| 14 | text | &lt;p&gt; | Photos for this tour are not available yet. |
| 21 | text | &lt;p&gt; | Photo |
| 23 | text | &lt;span&gt; | View all |
| 23 | text | &lt;span&gt; | photo |
| 25 | a11y | attr:aria-label | Tour photos |
| 25 | a11y | attr:aria-label | Close photos |
| 25 | a11y | attr:aria-label | Previous photo |
| 25 | a11y | attr:aria-label | Next photo |

</details>

<details>
<summary><code>libs/components/tour/detail/TourHeader.tsx</code> — 11 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 23 | alert | call:sweetTopSmallSuccessAlert | Link copied to clipboard! |
| 33 | a11y | attr:aria-label | Breadcrumb |
| 35 | text | &lt;Link&gt; | Home |
| 39 | text | &lt;Link&gt; | Tours |
| 63 | text | &lt;span&gt; | reviews) |
| 68 | text | jsx-child | Destination unavailable |
| 79 | text | &lt;span&gt; | Departs: |
| 79 | text | jsx-child | Location unavailable |
| 89 | text | &lt;span&gt; | Share |
| 102 | text | jsx-child | Liked |
| 102 | text | jsx-child | Like |

</details>

<details>
<summary><code>libs/components/tour/detail/TourOverview.tsx</code> — 26 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 39 | label | var:organizerName | Organizer |
| 62 | alert | call:sweetErrorAlert | Unable to update follow status. |
| 79 | text | &lt;h2&gt; | About this tour |
| 81 | text | &lt;span&gt; | Duration |
| 82 | text | &lt;span&gt; | Start date |
| 83 | text | &lt;span&gt; | End date |
| 84 | text | &lt;span&gt; | Availability |
| 84 | text | &lt;span&gt; | seats |
| 85 | text | &lt;span&gt; | Departure |
| 85 | text | jsx-child | Unavailable |
| 86 | text | &lt;span&gt; | Saved by |
| 86 | text | &lt;span&gt; | traveler |
| 87 | text | &lt;span&gt; | Views |
| 89 | text | &lt;p&gt; | The organizer has not added a tour description yet. |
| 92 | text | &lt;h3&gt; | Tour information |
| 95 | text | &lt;h3&gt; | Departure & destination |
| 95 | text | jsx-child | Departure details are not available yet. |
| 96 | a11y | attr:title | ${tour.tourName} destination map |
| 96 | text | &lt;a&gt; | Open map |
| 101 | text | &lt;span&gt; | Agent |
| 101 | text | jsx-child | Verified tour operator |
| 101 | text | jsx-child | Tour organizer |
| 101 | text | &lt;span&gt; | Followers |
| 101 | text | &lt;span&gt; | Tours |
| 102 | text | &lt;Link&gt; | View profile |
| 102 | text | &lt;button&gt; | Message |

</details>

<details>
<summary><code>libs/components/tour/detail/TourReservationWidget.tsx</code> — 16 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 49 | alert | call:sweetErrorAlert | This tour no longer has enough available seats. |
| 55 | alert | call:sweetErrorAlert | Unable to open secure checkout. Please try again. |
| 68 | text | &lt;span&gt; | / person |
| 73 | text | &lt;span&gt; | Tour dates |
| 73 | text | &lt;span&gt; | seat |
| 73 | text | &lt;span&gt; | available |
| 74 | text | &lt;div&gt; | Seats are confirmed after successful payment. |
| 76 | text | &lt;label&gt; | Travelers |
| 76 | text | jsx-child | Traveler |
| 76 | text | jsx-child | Travelers |
| 81 | text | jsx-child | Preparing secure payment... |
| 81 | text | jsx-child | Sold out |
| 81 | text | jsx-child | Reserve tour |
| 82 | text | &lt;p&gt; | A secure Stripe payment form opens before any charge is confirmed. |
| 83 | text | &lt;span&gt; | traveler |
| 83 | text | &lt;span&gt; | Total |

</details>

<details>
<summary><code>libs/components/tour/TourCard.tsx</code> — 5 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 28 | text | &lt;div&gt; | No image available |
| 45 | text | jsx-child | Location unavailable |
| 56 | text | &lt;span&gt; | From |
| 59 | text | &lt;span&gt; | Per traveler |
| 62 | text | &lt;span&gt; | View package |

</details>

<details>
<summary><code>libs/components/tour/TourFilter.tsx</code> — 17 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 13 | label | prop:label | 1 Traveler |
| 14 | label | prop:label | 2 Travelers |
| 157 | text | &lt;h2&gt; | Filters |
| 160 | text | &lt;button&gt; | Clear All |
| 166 | text | &lt;label&gt; | Destination |
| 172 | attr | attr:placeholder | Search country or city... |
| 182 | text | &lt;label&gt; | Price Range |
| 183 | text | &lt;span&gt; | Per person (USD) |
| 202 | text | &lt;span&gt; | Min |
| 206 | text | &lt;span&gt; | Max |
| 208 | text | jsx-child | Max (All) |
| 217 | text | &lt;label&gt; | Departure Date |
| 229 | text | &lt;label&gt; | Return Date |
| 244 | text | &lt;label&gt; | Travelers |
| 264 | text | &lt;span&gt; | Private Itineraries |
| 267 | text | &lt;p&gt; | Need bespoke dates or private aircraft charters? Talk directly with an expedition specialist. |
| 270 | text | &lt;span&gt; | Inquire Bespoke Tour |

</details>

<details>
<summary><code>libs/components/tour/TourHero.tsx</code> — 3 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 24 | text | &lt;span&gt; | CURATED EXPEDITIONS &amp; VOYAGES |
| 29 | text | &lt;h1&gt; | Discover Extraordinary Journeys |
| 33 | text | &lt;p&gt; | Unforgettable experiences, thoughtfully curated. Venture into remote landscapes with elite naturalists and private charters. |

</details>

<details>
<summary><code>pages/tour/detail.tsx</code> — 6 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 51 | alert | call:sweetErrorAlert | Error occurred |
| 80 | text | &lt;span&gt; | Loading expedition details... |
| 90 | text | &lt;h1&gt; | Tour unavailable |
| 90 | text | &lt;p&gt; | This tour could not be found or is no longer available. |
| 98 | text | &lt;title&gt; | \| AURA Curated Expedition |
| 101 | meta | attr:content | Curated high-alpine expedition by AURA. |

</details>

<details>
<summary><code>pages/tour/index.tsx</code> — 17 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 190 | text | &lt;title&gt; | AURA \| Curated Tours &amp; Expeditions |
| 191 | meta | attr:content | AURA Tours & Expeditions |
| 213 | text | &lt;h2&gt; | Explore Tours |
| 214 | text | &lt;span&gt; | journeys available |
| 219 | text | &lt;span&gt; | Sort by |
| 226 | text | &lt;option&gt; | Recommended |
| 227 | text | &lt;option&gt; | Price: Low to High |
| 228 | text | &lt;option&gt; | Price: High to Low |
| 229 | text | &lt;option&gt; | Departure Date |
| 230 | text | &lt;option&gt; | Most Popular |
| 231 | text | &lt;option&gt; | Top Rated |
| 232 | text | &lt;option&gt; | Newest |
| 245 | text | &lt;h3&gt; | No Journeys Found |
| 246 | text | &lt;p&gt; | Try adjusting your search filters or destination criteria. |
| 278 | text | &lt;Typography&gt; | Total |
| 278 | text | &lt;Typography&gt; | journey |
| 278 | text | &lt;Typography&gt; | available |

</details>

### Destinations

<details>
<summary><code>libs/components/destination/DestinationCard.tsx</code> — 4 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 76 | a11y | attr:aria-label | Save to favorites |
| 97 | text | jsx-child | Experience the extraordinary natural landscapes and discreet architecture of ${destination.destinationName}. |
| 104 | text | &lt;span&gt; | Stays |
| 109 | text | &lt;span&gt; | Tours |

</details>

<details>
<summary><code>libs/components/destination/DestinationFilter.tsx</code> — 16 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 12 | label | prop:label | All |
| 13 | label | prop:label | Asia |
| 14 | label | prop:label | Europe |
| 15 | label | prop:label | Africa |
| 16 | label | prop:label | North America |
| 17 | label | prop:label | South America |
| 18 | label | prop:label | Oceania |
| 47 | text | &lt;span&gt; | Worldwide Atlas |
| 55 | text | &lt;h2&gt; | Discover Destinations |
| 56 | text | &lt;span&gt; | territories curated |
| 59 | text | &lt;p&gt; | Curated gateways to the world&apos;s most evocative landscapes. |
| 64 | text | &lt;span&gt; | Sort: |
| 71 | text | &lt;option&gt; | Curated Index |
| 72 | text | &lt;option&gt; | Most Popular |
| 73 | text | &lt;option&gt; | Top Rated |
| 74 | text | &lt;option&gt; | Newest Added |

</details>

<details>
<summary><code>libs/components/destination/DestinationHero.tsx</code> — 3 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 24 | text | &lt;span&gt; | GLOBAL SANCTUARIES &amp; TERRITORIES |
| 26 | text | &lt;h1&gt; | Explore the World |
| 27 | text | &lt;p&gt; | Every destination has a story. |

</details>

<details>
<summary><code>libs/components/destination/detail/DestinationAbout.tsx</code> — 23 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 26 | alert | call:sweetTopSmallSuccessAlert | Link copied to clipboard! |
| 34 | a11y | attr:aria-label | Breadcrumb |
| 35 | text | &lt;Link&gt; | Destinations |
| 44 | text | &lt;span&gt; | Destination overview |
| 45 | text | &lt;h1&gt; | Discover |
| 49 | text | &lt;p&gt; | Destination description is not available yet. |
| 52 | a11y | attr:aria-label | Destination engagement |
| 56 | text | &lt;span&gt; | views |
| 58 | a11y | attr:aria-label | Like destination |
| 61 | text | &lt;span&gt; | likes |
| 63 | a11y | attr:title | Jump to traveler comments |
| 66 | text | &lt;span&gt; | comments |
| 71 | text | &lt;span&gt; | reviews) |
| 78 | text | jsx-child | Copied Link! |
| 78 | text | jsx-child | Share |
| 81 | text | &lt;a&gt; | Explore Cities |
| 91 | text | &lt;div&gt; | Destination |
| 100 | text | &lt;div&gt; | Available stays |
| 101 | text | &lt;h3&gt; | properties |
| 102 | text | &lt;p&gt; | Real accommodations listed for this destination |
| 109 | text | &lt;div&gt; | Available tours |
| 110 | text | &lt;h3&gt; | tours |
| 112 | text | jsx-child | Coordinates are not available yet |

</details>

<details>
<summary><code>libs/components/destination/detail/DestinationCities.tsx</code> — 4 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 17 | text | &lt;h2&gt; | Explore |
| 18 | text | &lt;p&gt; | Find your next favorite destination. |
| 45 | text | jsx-child | Historic heritage seamlessly interwoven with breathtaking topography in ${city.destinationName}. |
| 48 | text | &lt;span&gt; | Explore |

</details>

<details>
<summary><code>libs/components/destination/detail/DestinationContinueExploring.tsx</code> — 4 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 31 | text | &lt;h2&gt; | Continue Exploring |
| 33 | text | &lt;p&gt; | Iconic curated destinations across East Asia &amp; beyond. |
| 67 | text | jsx-child | Tradition meets visionary architecture across iconic landscapes in ${dest.destinationName}. |
| 70 | text | &lt;span&gt; | Explore |

</details>

<details>
<summary><code>libs/components/destination/detail/DestinationDetailHero.tsx</code> — 7 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 42 | a11y | attr:aria-label | ${destination.destinationName} image gallery |
| 53 | text | &lt;div&gt; | No destination images available |
| 57 | a11y | attr:aria-label | More destination images |
| 65 | a11y | attr:aria-label | Show destination image ${index + 1} of ${imageCount} |
| 73 | a11y | attr:aria-label | Previous destination image |
| 77 | a11y | attr:aria-label | Next destination image |
| 80 | text | &lt;strong&gt; | photos |

</details>

<details>
<summary><code>libs/components/destination/detail/DestinationPopularTours.tsx</code> — 11 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 32 | text | &lt;h2&gt; | Popular Tours &amp; Experiences |
| 33 | text | &lt;p&gt; | Unforgettable adventures across |
| 36 | text | &lt;span&gt; | Explore All Tours |
| 43 | text | &lt;p&gt; | Loading top tours… |
| 44 | text | &lt;p&gt; | Top tours are unavailable right now. |
| 74 | a11y | attr:aria-label | Wishlist Tour |
| 87 | text | jsx-child | Scheduled tour |
| 87 | text | jsx-child | Dates to be announced |
| 120 | text | jsx-child | Price on request |
| 121 | text | &lt;span&gt; | per person |
| 124 | text | &lt;Link&gt; | View Package |

</details>

<details>
<summary><code>libs/components/destination/detail/DestinationReviews.tsx</code> — 23 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 36 | label | prop:1 | 1.0 / 5.0 (Poor) |
| 37 | label | prop:2 | 2.0 / 5.0 (Fair) |
| 38 | label | prop:3 | 3.0 / 5.0 (Good) |
| 39 | label | prop:4 | 4.0 / 5.0 (Very Good) |
| 40 | label | prop:5 | 5.0 / 5.0 (Exceptional) |
| 107 | text | &lt;h2&gt; | Traveler Reviews &amp; Notes |
| 108 | text | &lt;span&gt; | Community |
| 111 | text | &lt;p&gt; | Authentic insights, local tips, and notes from verified travelers. |
| 131 | text | jsx-child | ${totalReviews} verified traveler ratings |
| 131 | text | jsx-child | Curated ratings |
| 142 | text | &lt;span&gt; | Rate this destination: |
| 150 | a11y | attr:aria-label | ${star} star |
| 170 | text | jsx-child | Logged in as ${user.memberNick} |
| 170 | text | jsx-child | Sign in to post note |
| 175 | a11y | attr:alt | User |
| 180 | attr | attr:placeholder | Share a travel tip, local secret, or note about ${destinationName}... |
| 190 | a11y | attr:aria-label | Submit note |
| 201 | text | jsx-child | Posting... |
| 201 | text | jsx-child | Post Note |
| 212 | text | &lt;h3&gt; | No traveler notes yet |
| 214 | text | &lt;p&gt; | Be the first traveler to post a note or tip for |
| 219 | label | jsx-child &gt; var:authorName | Traveler |
| 259 | a11y | attr:aria-label | Helpful review |

</details>

<details>
<summary><code>libs/components/destination/detail/DestinationTopStays.tsx</code> — 9 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 33 | text | &lt;h2&gt; | Top Stays in |
| 34 | text | &lt;p&gt; | Discover exceptional places to stay. |
| 37 | text | &lt;span&gt; | View All Hotels |
| 44 | text | &lt;p&gt; | Loading top stays… |
| 45 | text | &lt;p&gt; | Top stays are unavailable right now. |
| 75 | a11y | attr:aria-label | Save to Wishlist |
| 113 | text | jsx-child | Price on request |
| 114 | text | &lt;span&gt; | / night |
| 117 | text | &lt;Link&gt; | Reserve |

</details>

<details>
<summary><code>libs/components/destination/detail/DestinationTravelers.tsx</code> — 8 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 19 | alert | call:sweetMixinErrorAlert | Please login first! |
| 20 | alert | call:sweetMixinErrorAlert | Unable to update follow status. |
| 23 | text | &lt;h2&gt; | Travelers Who Explored |
| 23 | text | &lt;p&gt; | Meet people who have experienced this destination. |
| 23 | text | &lt;p&gt; | Loading travelers… |
| 23 | text | &lt;p&gt; | Travelers are unavailable right now. |
| 23 | text | &lt;span&gt; | journeys |
| 23 | text | &lt;Link&gt; | View Profile |

</details>

<details>
<summary><code>pages/destination/detail.tsx</code> — 4 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 232 | text | &lt;span&gt; | Loading destination sanctuary... |
| 241 | text | &lt;title&gt; | AURA \| Discover |
| 244 | meta | attr:content | Discover ${destination.destinationName} — Sanctuaries & Expeditions \| AURA Travel |
| 248 | meta | attr:content | Curated global destination sanctuaries. |

</details>

<details>
<summary><code>pages/destination/index.tsx</code> — 10 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 176 | text | &lt;title&gt; | AURA \| Explore the World - Curated Destinations |
| 179 | meta | attr:content | Explore the World — Global Sanctuaries &amp; Territories \| AURA Travel |
| 202 | text | &lt;h3&gt; | Loading destinations... |
| 208 | text | &lt;h3&gt; | No destinations found |
| 210 | text | &lt;p&gt; | No curated sanctuaries or territories found in this selection yet. |
| 236 | a11y | attr:aria-label | Previous page |
| 260 | a11y | attr:aria-label | Next page |
| 268 | text | &lt;p&gt; | Showing |
| 268 | text | &lt;p&gt; | of |
| 268 | text | &lt;p&gt; | curated destinations worldwide |

</details>

### Community

<details>
<summary><code>libs/components/community/CommunityCard.tsx</code> — 12 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 17 | label | prop:TOUR | Itinerary / Expedition |
| 18 | label | prop:HOTEL | Hotel Review |
| 19 | label | prop:DESTINATION | Photography & Sights |
| 20 | label | prop:GUIDE | Expedition Log |
| 21 | label | prop:NEWS | Local Insight |
| 48 | label | var:authorName | Member |
| 58 | label | var:categoryBadge | Uncategorized |
| 73 | alert | call:sweetTopSmallSuccessAlert | Story link copied to clipboard! |
| 75 | alert | call:sweetTopSmallSuccessAlert | Link copied! |
| 122 | text | &lt;span&gt; | min read |
| 178 | a11y | attr:title | Share story |
| 186 | text | &lt;span&gt; | Read Full Dispatch |

</details>

<details>
<summary><code>libs/components/community/CommunityFilter.tsx</code> — 7 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 10 | label | prop:label | All Stories |
| 11 | label | prop:label | Itineraries |
| 12 | label | prop:label | Hotel Reviews |
| 13 | label | prop:label | Photography |
| 14 | label | prop:label | Expedition Logs |
| 15 | label | prop:label | Local Insights |
| 28 | a11y | attr:aria-label | Community Categories |

</details>

<details>
<summary><code>libs/components/community/CommunityHeader.tsx</code> — 7 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 18 | label | prop:label | Trending |
| 19 | label | prop:label | Latest |
| 20 | label | prop:label | Top Rated |
| 46 | text | &lt;span&gt; | Global Dispatch |
| 48 | text | &lt;h1&gt; | Travelers Community |
| 50 | text | &lt;p&gt; | Stories, itineraries, and insider dispatches from verified explorers and world-class hosts across six continents. |
| 93 | text | &lt;span&gt; | Write Story |

</details>

<details>
<summary><code>libs/components/community/CommunitySidebar.tsx</code> — 15 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 74 | alert | call:sweetMixinErrorAlert | Please log in first to follow members. |
| 83 | alert | call:sweetMixinErrorAlert | You cannot follow yourself. |
| 108 | alert | call:sweetMixinErrorAlert | Action failed. |
| 125 | text | &lt;h3&gt; | Hotel hosts |
| 126 | text | &lt;p&gt; | Hosts with currently published properties |
| 130 | text | &lt;Link&gt; | Explore |
| 175 | text | jsx-child | Loading hosts... |
| 177 | text | jsx-child | Hosts could not be loaded. |
| 178 | text | jsx-child | No hotel hosts are available yet. |
| 189 | text | &lt;h3&gt; | Tour organizers |
| 190 | text | &lt;p&gt; | Organizers with currently published tours |
| 194 | text | &lt;Link&gt; | Explore |
| 244 | text | jsx-child | Loading organizers... |
| 246 | text | jsx-child | Organizers could not be loaded. |
| 247 | text | jsx-child | No tour organizers are available yet. |

</details>

<details>
<summary><code>libs/components/community/detail/CommunityDetailBody.tsx</code> — 1 string</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 20 | text | &lt;p&gt; | No content available for this article. |

</details>

<details>
<summary><code>libs/components/community/detail/CommunityDetailBreadcrumb.tsx</code> — 3 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 17 | a11y | attr:aria-label | Breadcrumb |
| 19 | text | &lt;Link&gt; | Home |
| 23 | text | &lt;Link&gt; | Community |

</details>

<details>
<summary><code>libs/components/community/detail/CommunityDetailComments.tsx</code> — 24 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 34 | label | return: | Just now |
| 35 | label | return: | ${diffHours} hours ago |
| 37 | label | return: | ${diffDays} days ago |
| 40 | label | return: | ${diffWeeks} week${diffWeeks &gt; 1 ? "s" : ""} ago |
| 41 | label | return: | ${Math.floor(diffDays / 30)} mo ago |
| 105 | alert | call:sweetMixinErrorAlert | Please enter a comment |
| 145 | a11y | attr:aria-label | Reader Comments |
| 151 | text | &lt;h2&gt; | Comments |
| 165 | text | &lt;option&gt; | Sort: Newest |
| 166 | text | &lt;option&gt; | Sort: Oldest |
| 175 | text | &lt;p&gt; | Loading comments... |
| 183 | label | jsx-child &gt; var:authorName | Member |
| 221 | text | &lt;p&gt; | No comments yet. Be the first to share your perspectives! |
| 229 | text | &lt;span&gt; | Showing |
| 230 | text | &lt;span&gt; | of |
| 231 | text | &lt;span&gt; | comments |
| 240 | a11y | attr:aria-label | Previous page |
| 264 | a11y | attr:aria-label | Next page |
| 278 | a11y | attr:alt | User profile |
| 280 | text | &lt;h3&gt; | Join the Conversation |
| 288 | attr | attr:placeholder | Share your thoughts, experience, or a question about this article... |
| 300 | text | &lt;span&gt; | / 500 characters |
| 309 | text | jsx-child | Posting... |
| 309 | text | jsx-child | Post Comment |

</details>

<details>
<summary><code>libs/components/community/detail/CommunityDetailEngagementBar.tsx</code> — 5 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 24 | alert | call:sweetTopSmallSuccessAlert | Link copied to clipboard! |
| 26 | alert | call:sweetTopSmallSuccessAlert | Link copied! |
| 63 | text | &lt;span&gt; | Comments |
| 75 | text | &lt;span&gt; | Copy Link |
| 80 | a11y | attr:aria-label | Share |

</details>

<details>
<summary><code>libs/components/community/detail/CommunityDetailHeader.tsx</code> — 9 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 43 | label | var:authorName | Member |
| 59 | alert | call:sweetTopSmallSuccessAlert | Article URL copied to clipboard! |
| 61 | alert | call:sweetTopSmallSuccessAlert | Link copied! |
| 88 | text | jsx-child | Published ${publishedDate} · |
| 89 | text | &lt;span&gt; | min read |
| 99 | a11y | attr:aria-label | Share article |
| 111 | text | &lt;span&gt; | Views |
| 121 | text | &lt;span&gt; | Likes |
| 126 | text | &lt;span&gt; | Comments |

</details>

<details>
<summary><code>libs/components/community/detail/CommunityDetailRelated.tsx</code> — 10 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 14 | label | prop:TOUR | Itineraries |
| 15 | label | prop:HOTEL | Hotel Reviews |
| 16 | label | prop:DESTINATION | Photography |
| 17 | label | prop:GUIDE | Expedition Log |
| 18 | label | prop:NEWS | Local Insights |
| 49 | text | &lt;h2&gt; | You Might Also Like |
| 50 | text | &lt;p&gt; | More stories to inspire your next adventure. |
| 53 | text | &lt;span&gt; | Explore Community |
| 62 | label | jsx-child &gt; var:authorName | Member |
| 64 | label | jsx-child &gt; var:catLabel | Uncategorized |

</details>

<details>
<summary><code>libs/components/community/WriteStoryModal.tsx</code> — 24 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 97 | alert | new:Error | Upload failed |
| 101 | alert | call:sweetMixinErrorAlert | Image upload failed |
| 136 | alert | call:sweetTopSmallSuccessAlert | Your story has been updated successfully! |
| 145 | alert | call:sweetTopSmallSuccessAlert | Your story has been dispatched successfully! |
| 169 | text | jsx-child | Edit Your Story |
| 169 | text | jsx-child | Dispatch a New Story |
| 175 | a11y | attr:aria-label | Close modal |
| 184 | text | &lt;label&gt; | Story Category |
| 191 | text | &lt;option&gt; | Itinerary & Expeditions (TOUR) |
| 192 | text | &lt;option&gt; | Hotel & Stay Reviews (HOTEL) |
| 193 | text | &lt;option&gt; | Photography & Sights (DESTINATION) |
| 194 | text | &lt;option&gt; | Expedition Logs (GUIDE) |
| 195 | text | &lt;option&gt; | Local Insights (NEWS) |
| 201 | text | &lt;label&gt; | Story Title |
| 204 | attr | attr:placeholder | e.g. Solitude at 3,000m: High Alpine Cabins of Zermatt |
| 214 | text | &lt;label&gt; | Cover Photography (Optional) |
| 217 | a11y | attr:alt | Cover preview |
| 237 | text | &lt;span&gt; | Uploading... |
| 244 | text | &lt;label&gt; | Story Content |
| 247 | attr | attr:placeholder | Share the raw details, gear recommendations, hidden trailways, and atmosphere... |
| 263 | text | &lt;button&gt; | Cancel |
| 270 | text | jsx-child | Saving... |
| 270 | text | jsx-child | Save Changes |
| 270 | text | jsx-child | Publish Dispatch |

</details>

<details>
<summary><code>pages/community/detail.tsx</code> — 19 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 21 | label | prop:label | Itineraries |
| 22 | label | prop:label | Hotel Reviews |
| 23 | label | prop:label | Photography |
| 24 | label | prop:label | Travel Tips |
| 25 | label | prop:label | Local Insights |
| 90 | alert | call:sweetMixinErrorAlert | Please login first to like this article! |
| 105 | alert | call:sweetMixinErrorAlert | Error occurred while liking |
| 112 | alert | call:sweetMixinErrorAlert | Please login first to follow! |
| 117 | alert | call:sweetMixinErrorAlert | You cannot follow yourself. |
| 129 | alert | call:sweetMixinErrorAlert | Unable to update follow status. |
| 143 | label | prop:label | Uncategorized |
| 150 | text | jsx-child | ${article.articleTitle} — AURA Travel Community |
| 151 | text | jsx-child | Community Story — AURA Travel |
| 157 | meta | attr:content | Read full traveler dispatches and expeditions on AURA. |
| 166 | text | &lt;p&gt; | Loading dispatch... |
| 218 | text | jsx-child | Unable to load dispatch |
| 218 | text | jsx-child | Dispatch Not Found |
| 222 | text | jsx-child | Choose a community dispatch from the community page to read it. |
| 229 | text | &lt;button&gt; | Back to Community |

</details>

<details>
<summary><code>pages/community/index.tsx</code> — 14 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 287 | alert | call:sweetMixinErrorAlert | Please log in first to like articles! |
| 315 | alert | call:sweetMixinErrorAlert | Error occurred while liking |
| 324 | text | &lt;title&gt; | AURA — Travelers Community & Global Dispatches |
| 327 | meta | attr:content | Stories, itineraries, and insider dispatches from verified explorers and world-class hosts across six continents. |
| 353 | text | &lt;p&gt; | Retrieving dispatches from worldwide explorers... |
| 362 | text | &lt;h3&gt; | Unable to load dispatches |
| 386 | text | &lt;h3&gt; | No Dispatches Found |
| 388 | text | &lt;p&gt; | There are currently no community dispatches published in this category. Be the first explorer to chronicle your journey! |
| 398 | text | &lt;span&gt; | Write First Story |
| 407 | text | &lt;div&gt; | Showing |
| 412 | text | &lt;div&gt; | of |
| 412 | text | &lt;div&gt; | stories |
| 425 | text | &lt;span&gt; | Previous |
| 452 | text | &lt;span&gt; | Next |

</details>

### Customer support

<details>
<summary><code>libs/components/cs/CsContactForm.tsx</code> — 8 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 67 | alert | call:sweetMixinErrorAlert | Only JPG and PNG images are supported. |
| 72 | alert | call:sweetMixinErrorAlert | Attachment must be smaller than 10MB. |
| 102 | alert | new:Error | Upload failed |
| 105 | label | call:setFileName | Attached: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB) |
| 108 | alert | call:sweetMixinErrorAlert | Attachment upload failed |
| 129 | alert | call:sweetMixinErrorAlert | Please describe your request in at least 10 characters. |
| 212 | attr | attr:placeholder | e.g. Elena Rostova |
| 224 | attr | attr:placeholder | e.g. elena@example.com |

</details>

<details>
<summary><code>pages/cs/index.tsx</code> — 81 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 21 | text | &lt;h1&gt; | CS PAGE MOBILE |
| 36 | text | &lt;span&gt; | AURA Concierge & Support |
| 38 | text | &lt;h1&gt; | How can we help you? |
| 40 | text | &lt;p&gt; | Find answers, manage bespoke itineraries, and return to seamless exploration. |
| 51 | attr | attr:placeholder | Search for help, bookings, cancellations, vouchers... |
| 63 | text | &lt;button&gt; | Find Answers |
| 67 | text | &lt;span&gt; | Quick prompts: |
| 72 | text | &lt;button&gt; | Cancellation policy |
| 78 | text | &lt;button&gt; | Refund timeline |
| 84 | text | &lt;button&gt; | Modify dates |
| 90 | text | &lt;button&gt; | Bespoke charter inquiry |
| 102 | text | &lt;span&gt; | Knowledge Repository |
| 103 | text | &lt;h2&gt; | Browse by Topic |
| 105 | text | &lt;p&gt; | Select an area to explore detailed operational guides, charter standards, and self-service tools. |
| 111 | text | &lt;span&gt; | Updated across all territories |
| 124 | text | &lt;h3&gt; | Bookings & Reservations |
| 126 | text | &lt;p&gt; | Manage active itineraries, date changes, guest assignments, and instant confirmation vouchers. |
| 131 | text | &lt;span&gt; | Explore 14 guides |
| 146 | text | &lt;h3&gt; | Hotels & Stays |
| 148 | text | &lt;p&gt; | Check-in protocols, sanctuary amenities, discrete host correspondence, and private key handoffs. |
| 153 | text | &lt;span&gt; | Explore 19 guides |
| 166 | text | &lt;h3&gt; | Tours & Experiences |
| 168 | text | &lt;p&gt; | Expedition briefings, private guides, specialized mountaineering gear requirements, and weather alerts. |
| 173 | text | &lt;span&gt; | Explore 12 guides |
| 188 | text | &lt;h3&gt; | Payments & Refunds |
| 190 | text | &lt;p&gt; | Discreet billing, multi-currency escrow security, and transparent real-time settlement timelines. |
| 195 | text | &lt;span&gt; | Explore 16 guides |
| 208 | text | &lt;h3&gt; | Account & Security |
| 210 | text | &lt;p&gt; | Two-factor hardware authentication, privacy directives, and encrypted passport credential storage. |
| 215 | text | &lt;span&gt; | Explore 9 guides |
| 230 | text | &lt;h3&gt; | Safety & Support |
| 232 | text | &lt;p&gt; | Emergency airside assistance, high-altitude medical directives, evacuation protocols, and charter insurance. |
| 237 | text | &lt;span&gt; | Explore 11 guides |
| 249 | text | &lt;span&gt; | Instant Knowledge |
| 250 | text | &lt;h2&gt; | Frequently Asked Questions |
| 252 | text | &lt;p&gt; | Instant resolutions to our travelers’ most common operational inquiries. |
| 260 | text | &lt;span&gt; | How do I make a hotel reservation? |
| 266 | text | &lt;div&gt; | Navigate to the |
| 266 | text | &lt;a&gt; | Hotels & Sanctuaries |
| 267 | text | &lt;div&gt; | section, select your destination and travel dates, and browse our verified architectural portfolio. Each property features suite configurations, exact floor plans, and amenities. You can book instantly with our encrypted one-click escrow or request bespoke con |
| 277 | text | &lt;span&gt; | How can I cancel my booking? |
| 283 | text | &lt;div&gt; | Cancellations are executed in seconds via |
| 284 | text | &lt;strong&gt; | My Page &gt; Bookings |
| 284 | text | &lt;div&gt; | . Select your active stay or tour and click "Initiate Cancellation." Under our Flexible Sanctuary Tier, full escrow refunds are credited automatically if cancelled at least 48 hours prior to local check-in time. Any applicable refund is returned instantly to y |
| 294 | text | &lt;span&gt; | Can I change my travel dates? |
| 300 | text | &lt;div&gt; | Yes. Date adjustments can be submitted seamlessly up to 72 hours before arrival, subject to partner availability. From your itinerary dashboard, select "Modify Dates." If there is a rate difference due to seasonal shifts, you will be prompted to approve the ad |
| 311 | text | &lt;span&gt; | How do I contact a hotel owner or expedition lead? |
| 318 | text | &lt;div&gt; | Once a booking is confirmed, direct end-to-end encrypted messaging unlocks via |
| 319 | text | &lt;a&gt; | AURA Airside Chat |
| 319 | text | &lt;div&gt; | . You can correspond directly with property managers, villa concierges, or lead mountaineers for ground transfers, private chefs, and custom equipment sizing. |
| 328 | text | &lt;span&gt; | How do I book a bespoke tour or private charter? |
| 335 | text | &lt;div&gt; | Access our |
| 335 | text | &lt;a&gt; | Curated Expeditions |
| 335 | text | &lt;div&gt; | portfolio and choose the "Private Departure" toggle, or send custom coordinates directly to the Concierge Desk using the contact form below. Our alpine logistics team prepares complete flight, guide, and security schedules within 4 hours. |
| 345 | text | &lt;span&gt; | Where can I find my booking details and receipts? |
| 352 | text | &lt;div&gt; | All itinerary documents, tax invoices, and cryptographic boarding cards are stored indefinitely in |
| 354 | text | &lt;a&gt; | My Page &gt; Bookings |
| 354 | text | &lt;div&gt; | . You can export authenticated PDF vouchers or generate Apple Wallet passes for off-grid access. |
| 362 | text | &lt;span&gt; | How do I reset my password or update security credentials? |
| 369 | text | &lt;div&gt; | Visit |
| 371 | text | &lt;strong&gt; | My Page &gt; Settings &gt; Security Controls |
| 373 | text | &lt;div&gt; | . Here, you can configure WebAuthn biometric passkeys, change master passwords, revoke concurrent session tokens, or adjust your public voyager display privacy. |
| 381 | text | &lt;span&gt; | How can I report a problem during an active journey? |
| 388 | text | &lt;div&gt; | Active travelers have top-priority access. Tap the urgent "Airside Dispatch" icon in the navigation header, call our 24/7 dedicated line printed on your itinerary, or submit an urgent support ticket below. Ground liaison teams will intervene immediately. |
| 401 | text | &lt;span&gt; | Direct Assistance |
| 402 | text | &lt;h2&gt; | Contact Support |
| 404 | text | &lt;p&gt; | Can't find what you're looking for? Send a dispatch directly to our concierge team. |
| 416 | text | &lt;span&gt; | Direct Support Desk |
| 418 | text | &lt;h3&gt; | Global Concierge Operations |
| 420 | text | &lt;p&gt; | Our dedicated travel concierges, dispatchers, and technical support specialists are stationed across Geneva, Tokyo, and New York. |
| 430 | text | &lt;p&gt; | Typical response time |
| 432 | text | &lt;p&gt; | Under 15 minutes for verified members (24/7 worldwide airside coverage). |
| 443 | text | &lt;span&gt; | End-to-end encrypted ticketing |
| 449 | text | &lt;span&gt; | Direct partner & host escalation |
| 456 | text | &lt;span&gt; | Multilingual concierge team (DE, EN, FR, JP) |
| 471 | text | &lt;div&gt; | Geneva Base Dispatch |
| 473 | text | &lt;div&gt; | Alpine Emergency Coordinates Active |
| 487 | text | &lt;h3&gt; | Still need help? |
| 489 | text | &lt;p&gt; | Our global support collective is on standby around the clock to ensure flawless travel execution. |
| 495 | text | &lt;span&gt; | Submit a Request |
| 499 | text | &lt;a&gt; | View FAQs |

</details>

### Checkout

<details>
<summary><code>pages/checkout/index.tsx</code> — 30 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 51 | alert | new:Error | Payment could not be completed. |
| 53 | alert | new:Error | Payment is still processing. |
| 57 | alert | call:sweetErrorAlert | Payment failed |
| 82 | text | jsx-child | Processing... |
| 82 | text | jsx-child | Pay $${paymentAmount.toLocaleString(undefined…} |
| 158 | alert | call:setInitializationError | Secure payment could not be initialized. Please try again. |
| 175 | alert | call:setInitializationError | Secure payment could not be initialized. Please try again. |
| 179 | alert | var:message | Failed to initialize payment |
| 196 | text | &lt;main&gt; | Loading... |
| 200 | text | &lt;main&gt; | Item not found or invalid link. |
| 219 | alert | call:sweetTopSmallSuccessAlert | Payment received. Finalizing your booking… |
| 225 | text | &lt;title&gt; | AURA Travel — Secure Checkout |
| 236 | text | &lt;h1&gt; | Payment Received |
| 237 | text | &lt;p&gt; | We are confirming your booking securely. It will appear in My Bookings once the payment webhook is processed. |
| 242 | text | &lt;button&gt; | View My Bookings |
| 249 | text | &lt;h1&gt; | Complete Your Booking |
| 250 | text | &lt;p&gt; | Review your reservation before securely completing your payment. |
| 261 | text | &lt;h2&gt; | Guest Information |
| 277 | text | &lt;h2&gt; | Secure Payment |
| 279 | text | &lt;p&gt; | All transactions are secure and encrypted. Stripe is in TEST MODE. |
| 282 | text | &lt;p&gt; | Stripe is not configured in this environment. |
| 285 | text | &lt;p&gt; | Select valid check-in and check-out dates before paying. |
| 287 | text | &lt;button&gt; | Back to property |
| 294 | text | &lt;button&gt; | Try again |
| 298 | text | &lt;p&gt; | Initializing secure payment... |
| 315 | text | &lt;h2&gt; | Price Summary |
| 321 | a11y | attr:alt | Thumbnail |
| 325 | text | jsx-child | Tour |
| 334 | text | &lt;span&gt; | Total Due |
| 348 | text | &lt;p&gt; | AURORA. All rights reserved. |

</details>

### Chat

<details>
<summary><code>libs/components/chat/ChatDossier.tsx</code> — 38 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 48 | label | var:name | Global Chat |
| 48 | label | var:name | Unavailable member |
| 70 | alert | call:sweetErrorAlert | Unable to update follow status. |
| 76 | a11y | attr:aria-label | Member information |
| 77 | text | &lt;p&gt; | Select a conversation to view details. |
| 84 | a11y | attr:aria-label | Member information |
| 92 | text | &lt;h3&gt; | AURORA Global |
| 94 | text | &lt;span&gt; | Community Lounge |
| 98 | text | &lt;span&gt; | Active |
| 101 | text | &lt;span&gt; | Public |
| 102 | text | &lt;span&gt; | Access |
| 108 | text | &lt;span&gt; | About |
| 110 | text | &lt;span&gt; | Connect and share with the AURORA travel community. Please follow our community guidelines to keep the lounge welcoming and respectful for everyone. |
| 118 | text | &lt;span&gt; | Shared Files & Media |
| 120 | text | &lt;span&gt; | 0 items |
| 126 | text | &lt;span&gt; | Attachments not supported yet. |
| 136 | a11y | attr:aria-label | Member information |
| 139 | text | &lt;div&gt; | Loading profile... |
| 150 | a11y | attr:title | Verified Partner |
| 155 | text | jsx-child | Hotel Partner |
| 155 | text | jsx-child | Tour Partner |
| 155 | text | jsx-child | Travel Partner |
| 156 | text | jsx-child | Traveler |
| 162 | text | &lt;span&gt; | Articles |
| 166 | text | &lt;span&gt; | Followers |
| 170 | text | &lt;span&gt; | Following |
| 177 | text | &lt;button&gt; | View Profile |
| 192 | text | &lt;span&gt; | About |
| 195 | text | &lt;span&gt; | Location |
| 200 | text | &lt;span&gt; | Member Since |
| 205 | text | &lt;span&gt; | Bio |
| 215 | text | &lt;span&gt; | Partner Details |
| 218 | text | &lt;span&gt; | Company |
| 222 | text | jsx-child | Active Hotels |
| 222 | text | jsx-child | Active Tours |
| 235 | text | &lt;span&gt; | Shared Files & Media |
| 237 | text | &lt;span&gt; | 0 items |
| 243 | text | &lt;span&gt; | Attachments not supported yet. |

</details>

<details>
<summary><code>libs/components/chat/ChatMessenger.tsx</code> — 11 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 119 | alert | new:Error | Unable to open this conversation. |
| 127 | alert | call:setDirectChatError | Unable to open this conversation. |
| 223 | alert | new:Error | Unable to delete this conversation. |
| 240 | alert | call:setDeleteError | Unable to delete this conversation. |
| 268 | alert | call:setHistoryError | Unable to load older messages. Please try again. |
| 272 | text | &lt;p&gt; | Please sign in to access messages. |
| 283 | text | &lt;h2&gt; | Delete chat? |
| 283 | text | &lt;p&gt; | This removes this conversation and its previous messages from your chat list only. The other participant keeps their history. |
| 283 | text | &lt;button&gt; | Cancel |
| 283 | text | jsx-child | Deleting… |
| 283 | text | jsx-child | Delete Chat |

</details>

<details>
<summary><code>libs/components/chat/ChatSidebar.tsx</code> — 15 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 67 | a11y | attr:aria-label | Conversations Directory |
| 69 | text | &lt;h2&gt; | Messages |
| 69 | text | &lt;span&gt; | unread |
| 70 | attr | attr:placeholder | Search conversations... |
| 76 | text | &lt;p&gt; | Loading conversations… |
| 81 | label | jsx-child &gt; var:name | Global Chat |
| 81 | label | jsx-child &gt; var:name | Unavailable member |
| 82 | label | jsx-child &gt; var:subtitle | Community |
| 82 | label | jsx-child &gt; var:subtitle | Travel partner |
| 82 | label | jsx-child &gt; var:subtitle | Traveler |
| 90 | text | jsx-child | No messages yet |
| 93 | a11y | attr:aria-label | Conversation actions for ${name} |
| 93 | text | &lt;button&gt; | View Profile |
| 93 | text | &lt;button&gt; | Delete Chat |
| 97 | text | &lt;p&gt; | No conversations found |

</details>

<details>
<summary><code>libs/components/chat/ChatThread.tsx</code> — 23 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 78 | alert | call:setSendError | Reconnecting to chat. Your message is still here. |
| 79 | alert | call:setSendError | Message could not be sent. Please try again. |
| 82 | alert | call:setSendError | Message could not be sent. Please try again. |
| 101 | text | &lt;p&gt; | Select a conversation to start messaging. |
| 108 | label | var:name | Global Chat |
| 109 | label | var:name | Unavailable member |
| 111 | label | var:subtitle | Community conversation |
| 113 | label | var:subtitle | Travel partner |
| 114 | label | var:subtitle | Traveler |
| 118 | a11y | attr:aria-label | Conversation Thread |
| 137 | text | &lt;span&gt; | Community |
| 143 | text | jsx-child | Connected |
| 145 | text | jsx-child | Reconnecting |
| 146 | text | jsx-child | Offline |
| 161 | text | &lt;button&gt; | Load older messages |
| 166 | text | &lt;p&gt; | Loading messages… |
| 176 | text | &lt;p&gt; | No messages yet. Say hello. |
| 187 | label | jsx-child &gt; var:senderName | Member |
| 248 | attr | attr:placeholder | Type a message… |
| 258 | a11y | attr:aria-label | Send message |
| 271 | text | jsx-child | Messages are delivered through AURORA. |
| 272 | text | jsx-child | Waiting for a secure chat connection… |
| 274 | text | &lt;span&gt; | Shift + Enter for new line |

</details>

<details>
<summary><code>pages/chat/index.tsx</code> — 3 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 17 | alert | call:sweetLoginRequiredAlert | Please log in first to access messages. |
| 25 | text | &lt;title&gt; | Messages — AURORA Travel Marketplace |
| 28 | meta | attr:content | Real-time community and direct messages for authenticated AURORA members. |

</details>

### Member profile

<details>
<summary><code>libs/components/member/MemberArticles.tsx</code> — 20 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 64 | alert | call:sweetMixinErrorAlert | Please log in to bookmark articles. |
| 73 | alert | call:sweetMixinErrorAlert | Action failed. |
| 77 | label | var:memberName | Member |
| 85 | text | &lt;h2&gt; | Articles |
| 86 | text | &lt;span&gt; | published |
| 89 | text | &lt;p&gt; | Travel journals, photo-essays, and architectural chronicles by |
| 100 | text | &lt;button&gt; | Newest |
| 107 | text | &lt;button&gt; | Most Liked |
| 114 | text | &lt;button&gt; | Most Viewed |
| 121 | text | &lt;p&gt; | Loading articles... |
| 126 | label | jsx-child &gt; var:readTime | ${Math.max(1, Math.ceil((article.article…} min read |
| 145 | text | jsx-child | Uncategorized |
| 151 | a11y | attr:aria-label | Bookmark |
| 199 | text | &lt;h3&gt; | No articles published yet |
| 201 | text | &lt;p&gt; | has not released any public dispatches or photo monographs yet. Check back soon for new expeditions. |
| 210 | text | &lt;span&gt; | Showing |
| 210 | text | &lt;span&gt; | of |
| 210 | text | &lt;span&gt; | articles |
| 216 | a11y | attr:aria-label | Previous page |
| 240 | a11y | attr:aria-label | Next page |

</details>

<details>
<summary><code>libs/components/member/MemberFollowers.tsx</code> — 22 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 58 | alert | call:sweetMixinErrorAlert | Please log in first. |
| 64 | alert | call:sweetMixinErrorAlert | You cannot follow yourself. |
| 72 | alert | call:sweetTopSmallSuccessAlert | Unfollowed. |
| 76 | alert | call:sweetTopSmallSuccessAlert | Following! |
| 80 | alert | call:sweetMixinErrorAlert | Action failed. |
| 84 | label | var:memberName | Member |
| 92 | text | &lt;h2&gt; | Followers |
| 93 | text | &lt;span&gt; | accounts |
| 95 | text | &lt;p&gt; | Explorers, collectors, and documentarians following |
| 104 | attr | attr:placeholder | Search ${memberName}'s followers... |
| 108 | text | &lt;span&gt; | Sort by: |
| 109 | text | &lt;span&gt; | Recently Added |
| 116 | text | &lt;p&gt; | Loading followers... |
| 146 | text | &lt;span&gt; | Member |
| 153 | text | &lt;span&gt; | AURA Explorer |
| 177 | text | &lt;h3&gt; | No followers yet |
| 178 | text | &lt;p&gt; | does not have any public followers yet. Be the first to connect! |
| 186 | text | &lt;span&gt; | Showing |
| 186 | text | &lt;span&gt; | of |
| 186 | text | &lt;span&gt; | accounts |
| 192 | a11y | attr:aria-label | Previous page |
| 216 | a11y | attr:aria-label | Next page |

</details>

<details>
<summary><code>libs/components/member/MemberFollowing.tsx</code> — 23 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 58 | alert | call:sweetMixinErrorAlert | Please log in first. |
| 64 | alert | call:sweetMixinErrorAlert | You cannot follow yourself. |
| 72 | alert | call:sweetTopSmallSuccessAlert | Unfollowed. |
| 76 | alert | call:sweetTopSmallSuccessAlert | Following! |
| 80 | alert | call:sweetMixinErrorAlert | Action failed. |
| 84 | label | var:memberName | Member |
| 92 | text | &lt;h2&gt; | Following |
| 93 | text | &lt;span&gt; | accounts |
| 95 | text | &lt;p&gt; | Sanctuaries, expeditions, and creators |
| 95 | text | &lt;p&gt; | follows. |
| 104 | attr | attr:placeholder | Search accounts ${memberName} follows... |
| 108 | text | &lt;span&gt; | Sort by: |
| 109 | text | &lt;span&gt; | Recently Added |
| 116 | text | &lt;p&gt; | Loading followed members... |
| 147 | text | &lt;span&gt; | Member |
| 154 | text | &lt;span&gt; | AURA Explorer |
| 178 | text | &lt;h3&gt; | Not following anyone yet |
| 179 | text | &lt;p&gt; | is not following any public explorers yet. |
| 187 | text | &lt;span&gt; | Showing |
| 187 | text | &lt;span&gt; | of |
| 187 | text | &lt;span&gt; | accounts |
| 193 | a11y | attr:aria-label | Previous page |
| 217 | a11y | attr:aria-label | Next page |

</details>

<details>
<summary><code>libs/components/member/MemberHeader.tsx</code> — 15 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 44 | alert | call:sweetMixinErrorAlert | Please log in to follow members. |
| 50 | alert | call:sweetMixinErrorAlert | You cannot follow yourself. |
| 69 | alert | call:sweetMixinErrorAlert | Action failed. |
| 75 | alert | call:sweetMixinErrorAlert | Please log in to send messages. |
| 81 | alert | call:sweetMixinErrorAlert | You cannot message yourself. |
| 99 | a11y | attr:alt | Member |
| 102 | a11y | attr:title | Available Explorer |
| 110 | a11y | attr:title | Verified Creator |
| 117 | text | &lt;span&gt; | Verified Explorer |
| 123 | text | jsx-child | Location not provided |
| 128 | text | jsx-child | Architectural traveler, high-alpine documentarian, and cultural enthusiast contributing to the AURA luxury collective. |
| 138 | text | &lt;span&gt; | Articles |
| 143 | text | &lt;span&gt; | Followers |
| 148 | text | &lt;span&gt; | Following |
| 165 | text | &lt;span&gt; | Message |

</details>

<details>
<summary><code>libs/components/member/MemberProducts.tsx</code> — 17 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 62 | alert | call:sweetMixinErrorAlert | Please log in first |
| 70 | alert | call:sweetMixinErrorAlert | Action failed |
| 77 | alert | call:sweetMixinErrorAlert | Please log in first |
| 85 | alert | call:sweetMixinErrorAlert | Action failed |
| 100 | label | var:memberName | Member |
| 101 | label | var:title | Hotel |
| 101 | label | var:title | Tour |
| 101 | label | var:title | Products |
| 111 | text | &lt;span&gt; | available |
| 113 | text | &lt;p&gt; | Explore offerings from |
| 118 | text | &lt;p&gt; | Loading |
| 146 | text | &lt;h3&gt; | No |
| 146 | text | &lt;h3&gt; | yet |
| 147 | text | &lt;p&gt; | has not published any |
| 147 | text | &lt;p&gt; | yet. |
| 155 | text | &lt;span&gt; | Showing |
| 155 | text | &lt;span&gt; | of |

</details>

<details>
<summary><code>libs/components/member/MemberSidebar.tsx</code> — 13 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 32 | label | var:memberSince | May 2022 |
| 39 | label | var:productsLabel | Hotel |
| 41 | label | var:productsLabel | Tour |
| 42 | label | var:productsLabel | Agent Products |
| 47 | a11y | attr:aria-label | Member Profile Sections |
| 67 | text | &lt;span&gt; | Articles |
| 106 | text | &lt;span&gt; | Followers |
| 119 | text | &lt;span&gt; | Following |
| 130 | text | &lt;span&gt; | Curator Credentials |
| 132 | text | &lt;p&gt; | Member since |
| 135 | text | jsx-child | ${member.memberPoints} Exploration Points · |
| 137 | text | jsx-child | Rank ${member.memberRank} · |
| 138 | text | &lt;p&gt; | Curated Journeys, Design Monographs & Alpine Expedition Contributor. |

</details>

<details>
<summary><code>pages/member/index.tsx</code> — 7 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 57 | label | var:memberTitle | Member |
| 62 | text | jsx-child | ${memberTitle} — AURA Member Profile |
| 62 | text | jsx-child | Member — AURA |
| 67 | meta | attr:content | Explore curated journals, monographs, and architectural chronicles on AURA. |
| 73 | text | &lt;p&gt; | Loading member profile… |
| 75 | text | &lt;p&gt; | Member ID parameter is required. |
| 78 | text | &lt;p&gt; | Member not found. |

</details>

### My Page

<details>
<summary><code>libs/components/mypage/AgentApplicationPage.tsx</code> — 47 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 65 | alert | call:sweetMixinErrorAlert | Please fill in all required fields. |
| 82 | alert | call:sweetTopSmallSuccessAlert | Application submitted successfully! |
| 85 | alert | call:sweetMixinErrorAlert | Failed to submit application. |
| 98 | text | &lt;span&gt; | PENDING REVIEW |
| 104 | text | &lt;span&gt; | APPROVED |
| 110 | text | &lt;span&gt; | NOT APPROVED |
| 119 | text | &lt;p&gt; | Loading application data... |
| 130 | text | &lt;h2&gt; | Your Agent Application |
| 131 | text | &lt;span&gt; | Track your application, review updates and manage your submission. |
| 135 | text | &lt;div&gt; | PARTNER PROGRAM |
| 136 | text | &lt;h2&gt; | Become an AURORA Partner |
| 137 | text | &lt;span&gt; | Share your hospitality or travel experiences with travelers around the world. |
| 146 | text | &lt;h3&gt; | Your application is under review |
| 147 | text | &lt;p&gt; | We've received your application. You can track its status here. |
| 150 | text | &lt;span&gt; | Agent Type |
| 151 | text | &lt;span&gt; | Company Name |
| 152 | text | &lt;span&gt; | Business Number |
| 153 | text | &lt;span&gt; | Submission Date |
| 157 | text | &lt;div&gt; | Our administrative team is currently reviewing your submission. |
| 165 | text | &lt;h3&gt; | You are an AURA Partner |
| 166 | text | &lt;p&gt; | Your application has been approved. If your sidebar has not updated, please refresh the page to access your Agent Workspace. |
| 168 | text | &lt;button&gt; | Refresh Page |
| 176 | text | &lt;h3&gt; | Your application needs some changes |
| 177 | text | &lt;p&gt; | Review the feedback below and submit a new application when you're ready. |
| 180 | text | &lt;div&gt; | Reason for rejection |
| 181 | text | jsx-child | No additional feedback was provided. |
| 185 | text | &lt;button&gt; | Apply Again |
| 196 | text | &lt;label&gt; | Partner Type |
| 204 | text | &lt;span&gt; | Hotel Partner |
| 206 | text | &lt;p&gt; | Manage hotels, villas, apartments and other stays. |
| 215 | text | &lt;span&gt; | Tour Partner |
| 217 | text | &lt;p&gt; | Offer tours and curated travel experiences. |
| 224 | text | &lt;label&gt; | Company Name |
| 229 | attr | attr:placeholder | e.g. Alpine Horizon Hospitality SA |
| 236 | text | &lt;label&gt; | Business Registration Number |
| 241 | attr | attr:placeholder | e.g. CHE-109.845.221 or VAT ID |
| 248 | text | &lt;label&gt; | Company Address |
| 253 | attr | attr:placeholder | e.g. Bahnhofstrasse 42, 3920 Zermatt, Switzerland |
| 260 | text | &lt;label&gt; | Company Description |
| 264 | attr | attr:placeholder | Briefly describe your services... |
| 273 | text | &lt;button&gt; | Cancel |
| 280 | text | jsx-child | Submitting... |
| 280 | text | jsx-child | Submit Application |
| 291 | text | &lt;h3&gt; | Application History |
| 313 | text | &lt;span&gt; | Company Name |
| 314 | text | &lt;span&gt; | Business Number |
| 316 | text | &lt;span&gt; | Rejection Reason |

</details>

<details>
<summary><code>libs/components/mypage/MyProfileArticles.tsx</code> — 19 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 70 | label | return: | Recently |
| 84 | alert | call:sweetConfirmAlert | Are you sure you want to delete this article? |
| 97 | alert | call:sweetTopSmallSuccessAlert | Article deleted successfully |
| 100 | alert | call:sweetMixinErrorAlert | Failed to delete article |
| 117 | text | &lt;h2&gt; | My Articles |
| 118 | text | &lt;span&gt; | published |
| 126 | text | &lt;option&gt; | Newest First |
| 127 | text | &lt;option&gt; | Most Read |
| 128 | text | &lt;option&gt; | Most Likes |
| 141 | text | &lt;span&gt; | Create Article |
| 150 | text | &lt;p&gt; | Loading your articles... |
| 154 | text | &lt;h3&gt; | Articles are unavailable |
| 190 | a11y | attr:aria-label | Options |
| 253 | text | &lt;button&gt; | Edit |
| 285 | text | &lt;button&gt; | Delete |
| 292 | text | jsx-child | No article summary provided. |
| 298 | text | &lt;span&gt; | min read |
| 330 | text | &lt;h3&gt; | No published articles yet |
| 332 | text | &lt;p&gt; | Share your high-altitude routes, architectural discoveries, and photo journals with the AURA community. |

</details>

<details>
<summary><code>libs/components/mypage/MyProfileBookings.tsx</code> — 44 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 57 | alert | call:sweetConfirmAlert | Are you sure you want to cancel this reservation? |
| 65 | alert | call:sweetTopSmallSuccessAlert | Reservation cancelled successfully. |
| 68 | alert | call:sweetMixinErrorAlert | Cancellation failed. |
| 75 | alert | call:sweetMixinErrorAlert | There are no dated bookings to export. |
| 82 | label | var:title | AURA booking |
| 99 | label | return: | Flexible Dates |
| 112 | text | &lt;h2&gt; | My Bookings |
| 114 | text | &lt;span&gt; | bookings · |
| 114 | text | &lt;span&gt; | active |
| 118 | text | &lt;p&gt; | Manage your upcoming and past trips with seamless concierge integration. |
| 131 | text | &lt;span&gt; | Export Calendar |
| 145 | text | &lt;button&gt; | All ( |
| 152 | text | &lt;button&gt; | Hotels ( |
| 159 | text | &lt;button&gt; | Tours ( |
| 170 | text | &lt;button&gt; | All Statuses ( |
| 177 | text | &lt;button&gt; | Upcoming ( |
| 184 | text | &lt;button&gt; | Completed |
| 191 | text | &lt;button&gt; | Cancelled |
| 198 | text | &lt;p&gt; | Loading your bookings... |
| 200 | text | &lt;h3&gt; | Bookings are unavailable |
| 206 | label | jsx-child &gt; var:title | Unavailable property |
| 207 | label | jsx-child &gt; var:title | Unavailable tour |
| 209 | label | jsx-child &gt; var:city | Location not provided |
| 210 | label | jsx-child &gt; var:city | Location not provided |
| 232 | text | jsx-child | HOTEL |
| 232 | text | jsx-child | TOUR |
| 248 | text | &lt;span&gt; | Guests |
| 260 | text | jsx-child | Cancelled |
| 260 | text | jsx-child | Confirmed |
| 260 | text | jsx-child | Completed |
| 267 | text | &lt;span&gt; | total · taxes included |
| 276 | text | &lt;button&gt; | View Details |
| 284 | text | &lt;button&gt; | Cancel |
| 298 | text | &lt;h3&gt; | No reservations found |
| 299 | text | &lt;p&gt; | Explore luxury hotels and bespoke expeditions to reserve your next journey. |
| 334 | text | &lt;span&gt; | Reservation Details |
| 351 | text | &lt;strong&gt; | Destination / Property: |
| 352 | text | jsx-child | Listing unavailable |
| 355 | text | &lt;strong&gt; | Stay / Tour Dates: |
| 358 | text | &lt;strong&gt; | Registered Guests: |
| 358 | text | &lt;div&gt; | persons |
| 361 | text | &lt;strong&gt; | Total Amount: |
| 364 | text | &lt;strong&gt; | Status: |
| 384 | text | &lt;button&gt; | Contact Atelier Concierge |

</details>

<details>
<summary><code>libs/components/mypage/MyProfileFollowers.tsx</code> — 16 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 54 | alert | call:sweetMixinErrorAlert | Please log in first. |
| 73 | alert | call:sweetMixinErrorAlert | Operation failed. |
| 104 | text | &lt;h2&gt; | Followers |
| 105 | text | &lt;span&gt; | followers |
| 112 | attr | attr:placeholder | Search followers... |
| 124 | text | &lt;option&gt; | Recently Followed |
| 125 | text | &lt;option&gt; | Name A–Z |
| 134 | text | &lt;p&gt; | Loading followers... |
| 136 | text | &lt;h3&gt; | Followers are unavailable |
| 143 | label | jsx-child &gt; var:followerNick | AURA member |
| 148 | label | jsx-child &gt; var:followerLocation | Location not provided |
| 190 | a11y | attr:aria-label | More options |
| 206 | text | jsx-child | No matching followers found |
| 206 | text | jsx-child | No followers yet |
| 210 | text | jsx-child | No followers match "${searchTerm}". |
| 211 | text | jsx-child | Share inspiring travel stories and photographs to build your explorer community. |

</details>

<details>
<summary><code>libs/components/mypage/MyProfileFollowing.tsx</code> — 16 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 45 | alert | call:sweetMixinErrorAlert | Please log in first. |
| 61 | alert | call:sweetMixinErrorAlert | Operation failed. |
| 92 | text | &lt;h2&gt; | Following |
| 93 | text | &lt;span&gt; | following |
| 100 | attr | attr:placeholder | Search following... |
| 110 | text | &lt;option&gt; | Recently Followed |
| 111 | text | &lt;option&gt; | Name A–Z |
| 120 | text | &lt;p&gt; | Loading followed accounts... |
| 122 | text | &lt;h3&gt; | Following list is unavailable |
| 128 | label | jsx-child &gt; var:targetNick | AURA member |
| 130 | label | jsx-child &gt; var:targetLocation | Location not provided |
| 159 | a11y | attr:aria-label | Account options |
| 174 | text | jsx-child | No matching accounts found |
| 174 | text | jsx-child | Not following anyone yet |
| 177 | text | jsx-child | No following accounts match "${searchTerm}". |
| 178 | text | jsx-child | Explore luxury sanctuaries, tour partners, and editors across the world to follow. |

</details>

<details>
<summary><code>libs/components/mypage/MyProfileHeader.tsx</code> — 8 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 60 | label | var:userNick | AURA traveller |
| 61 | label | var:userAddress | Location not provided |
| 80 | text | jsx-child | USER |
| 118 | text | &lt;div&gt; | Articles |
| 125 | text | &lt;div&gt; | Followers |
| 132 | text | &lt;div&gt; | Following |
| 144 | text | &lt;span&gt; | Become a Partner |
| 154 | text | &lt;span&gt; | Edit Profile |

</details>

<details>
<summary><code>libs/components/mypage/MyProfileHistory.tsx</code> — 9 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 33 | text | &lt;h2&gt; | Visited Hotels |
| 34 | text | &lt;span&gt; | hotels |
| 39 | text | &lt;p&gt; | Loading your visited hotels... |
| 41 | text | &lt;h3&gt; | Hotels history is unavailable |
| 46 | label | jsx-child &gt; var:loc | Location not provided |
| 53 | text | &lt;span&gt; | HOTEL |
| 61 | text | &lt;p&gt; | Recently viewed |
| 72 | text | &lt;h3&gt; | No hotels visited yet |
| 73 | text | &lt;p&gt; | Your viewed hotels will be saved here for quick reference. |

</details>

<details>
<summary><code>libs/components/mypage/MyProfileNotifications.tsx</code> — 14 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 217 | text | &lt;h2&gt; | Notifications |
| 221 | text | &lt;Box&gt; | unread |
| 231 | text | &lt;button&gt; | All |
| 237 | text | &lt;button&gt; | Unread ( |
| 242 | text | &lt;button&gt; | Mark all as read |
| 249 | text | &lt;p&gt; | Loading notifications... |
| 253 | text | &lt;p&gt; | No notifications found. |
| 285 | text | &lt;button&gt; | Follow Back |
| 288 | text | &lt;button&gt; | View Booking |
| 291 | text | &lt;button&gt; | View |
| 293 | a11y | attr:aria-label | Mark notification as read |
| 312 | text | &lt;p&gt; | Showing |
| 313 | text | &lt;p&gt; | of |
| 313 | text | &lt;p&gt; | notifications |

</details>

<details>
<summary><code>libs/components/mypage/MyProfileSettings.tsx</code> — 19 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 77 | alert | new:Error | Upload failed |
| 81 | alert | call:sweetMixinErrorAlert | Image upload failed |
| 113 | alert | call:sweetTopSmallSuccessAlert | Profile updated successfully! |
| 116 | alert | call:sweetMixinErrorAlert | Update failed. |
| 124 | text | &lt;h2&gt; | Account Settings |
| 125 | text | &lt;span&gt; | Profile & Preferences |
| 146 | a11y | attr:alt | Avatar |
| 150 | text | &lt;label&gt; | Profile Picture |
| 162 | text | jsx-child | Uploading... |
| 162 | text | jsx-child | Change Image |
| 174 | text | &lt;button&gt; | Remove |
| 198 | text | &lt;label&gt; | Explorer Nickname |
| 229 | text | &lt;label&gt; | Phone Number |
| 260 | text | &lt;label&gt; | Base Location / Residence |
| 266 | attr | attr:placeholder | e.g. Valais, Switzerland |
| 291 | text | &lt;label&gt; | Explorer Bio & Editorial Focus |
| 297 | attr | attr:placeholder | Tell the community about your travel pursuits... |
| 327 | text | jsx-child | Saving... |
| 327 | text | jsx-child | Save Profile Changes |

</details>

<details>
<summary><code>libs/components/mypage/MyProfileSidebar.tsx</code> — 21 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 82 | label | var:partnerTabLabel | Become a Partner |
| 84 | label | assign:partnerTabLabel | Agent Application |
| 112 | alert | call:sweetConfirmAlert | Do you want to log out from AURA? |
| 122 | label | prop:label | Articles |
| 128 | label | prop:label | Followers |
| 134 | label | prop:label | Following |
| 140 | label | prop:label | Wishlist |
| 146 | label | prop:label | Bookings |
| 153 | label | prop:label | Visited hotels |
| 159 | label | prop:label | Visited tours |
| 165 | label | prop:label | Notifications |
| 171 | label | prop:label | Settings |
| 229 | text | &lt;div&gt; | Partner Operations |
| 241 | text | &lt;span&gt; | My Hotels |
| 255 | text | &lt;span&gt; | My Tours |
| 270 | text | &lt;span&gt; | Reservations |
| 296 | text | &lt;span&gt; | Admin Dashboard |
| 314 | text | &lt;span&gt; | Log Out |
| 323 | text | &lt;span&gt; | AURA Direct Atelier |
| 326 | text | &lt;p&gt; | Need adjustments, private helicopter transfers, or custom dietary arrangements? |
| 334 | text | &lt;button&gt; | Chat with Curator |

</details>

<details>
<summary><code>libs/components/mypage/MyProfileVisitedTours.tsx</code> — 9 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 33 | text | &lt;h2&gt; | Visited Tours |
| 34 | text | &lt;span&gt; | tours |
| 39 | text | &lt;p&gt; | Loading your visited tours... |
| 41 | text | &lt;h3&gt; | Tours history is unavailable |
| 46 | label | jsx-child &gt; var:loc | Location not provided |
| 53 | text | &lt;span&gt; | TOUR |
| 61 | text | &lt;p&gt; | Recently viewed |
| 72 | text | &lt;h3&gt; | No tours visited yet |
| 73 | text | &lt;p&gt; | Your viewed tours and expeditions will be saved here. |

</details>

<details>
<summary><code>libs/components/mypage/MyProfileWishlist.tsx</code> — 15 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 118 | alert | call:sweetMixinErrorAlert | Action failed. |
| 127 | text | &lt;h2&gt; | My Wishlist |
| 128 | text | &lt;span&gt; | saved places |
| 140 | text | &lt;button&gt; | All ( |
| 149 | text | &lt;button&gt; | Hotels ( |
| 158 | text | &lt;button&gt; | Tours ( |
| 168 | text | &lt;p&gt; | Loading your wishlist... |
| 172 | text | &lt;h3&gt; | Wishlist is unavailable |
| 183 | label | jsx-child &gt; var:location | Location not provided |
| 186 | label | jsx-child &gt; var:location | Location not provided |
| 216 | attr | attr:description | No description provided. |
| 220 | attr | attr:priceUnit | / person |
| 220 | attr | attr:priceUnit | / night |
| 239 | text | &lt;h3&gt; | Your wishlist is empty |
| 241 | text | &lt;p&gt; | Explore sanctuaries, architectural hotels, and private tours across the world to save them here. |

</details>

<details>
<summary><code>libs/components/mypage/WishlistPlaceCard.tsx</code> — 2 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 153 | a11y | attr:aria-label | Go to image ${index + 1} |
| 187 | text | &lt;button&gt; | reserve |

</details>

<details>
<summary><code>pages/mypage/index.tsx</code> — 14 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 62 | label | return: | My Articles — AURA Profile |
| 64 | label | return: | Followers — AURA Profile |
| 66 | label | return: | Following — AURA Profile |
| 68 | label | return: | My Wishlist — AURA Profile |
| 70 | label | return: | My Bookings — AURA Profile |
| 72 | label | return: | Travel History — AURA Profile |
| 74 | label | return: | Notifications — AURA Profile |
| 76 | label | return: | Settings — AURA Profile |
| 78 | label | return: | Partner Application — AURA Profile |
| 80 | label | return: | My Hotels — AURA Agent |
| 82 | label | return: | My Tours — AURA Agent |
| 84 | label | return: | Reservations — AURA Agent |
| 86 | label | return: | My Profile — AURA Travel |
| 94 | meta | attr:content | Manage your AURA Travel profile, bookings, articles, and wishlist. |

</details>

### Agent workspace

<details>
<summary><code>libs/components/mypage/agent/AgentPropertyForm.tsx</code> — 34 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 93 | alert | new:Error | Image upload failed |
| 96 | alert | call:sweetMixinErrorAlert | Image upload failed |
| 107 | alert | call:sweetMixinErrorAlert | Destination, name and address are required. |
| 111 | alert | call:sweetMixinErrorAlert | Enter a valid nightly rate and at least 1 guest. |
| 138 | alert | call:sweetTopSmallSuccessAlert | Property updated |
| 141 | alert | call:sweetTopSmallSuccessAlert | Property submitted |
| 145 | alert | call:sweetMixinErrorAlert | Could not save the property. |
| 157 | text | jsx-child | Edit Hotel |
| 157 | text | jsx-child | Add Hotel |
| 159 | a11y | attr:aria-label | Close |
| 167 | text | &lt;label&gt; | Destination |
| 169 | text | jsx-child | Loading destinations… |
| 169 | text | jsx-child | Select destination |
| 179 | text | &lt;label&gt; | Property Type |
| 191 | text | &lt;label&gt; | Property Name |
| 197 | text | &lt;label&gt; | City |
| 201 | text | &lt;label&gt; | Address |
| 208 | text | &lt;label&gt; | Nightly Rate ($) |
| 212 | text | &lt;label&gt; | Max Guests |
| 216 | text | &lt;label&gt; | Bedrooms |
| 220 | text | &lt;label&gt; | Beds / Baths |
| 222 | a11y | attr:aria-label | Beds |
| 223 | a11y | attr:aria-label | Bathrooms |
| 229 | text | &lt;label&gt; | Description |
| 234 | text | &lt;label&gt; | Amenities |
| 251 | text | &lt;label&gt; | Photos ( |
| 256 | a11y | attr:alt | Property |
| 257 | a11y | attr:aria-label | Remove photo |
| 265 | text | jsx-child | Uploading… |
| 265 | text | jsx-child | Add photos |
| 274 | text | &lt;button&gt; | Cancel |
| 277 | text | jsx-child | Saving… |
| 277 | text | jsx-child | Save Changes |
| 277 | text | jsx-child | Submit Hotel |

</details>

<details>
<summary><code>libs/components/mypage/agent/AgentTourForm.tsx</code> — 35 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 82 | alert | new:Error | Image upload failed |
| 85 | alert | call:sweetMixinErrorAlert | Image upload failed |
| 99 | alert | call:sweetMixinErrorAlert | Destination and tour name are required. |
| 103 | alert | call:sweetMixinErrorAlert | Enter a valid price per person. |
| 107 | alert | call:sweetMixinErrorAlert | The end date must be after the start date. |
| 111 | alert | call:sweetMixinErrorAlert | Capacity must be at least ${Math.max(1, reservedSeats)}. |
| 136 | alert | call:sweetTopSmallSuccessAlert | Tour updated |
| 139 | alert | call:sweetTopSmallSuccessAlert | Tour created |
| 143 | alert | call:sweetMixinErrorAlert | Could not save the tour. |
| 155 | text | jsx-child | Edit Tour |
| 155 | text | jsx-child | Add Tour |
| 157 | a11y | attr:aria-label | Close |
| 165 | text | &lt;label&gt; | Destination |
| 167 | text | jsx-child | Loading destinations… |
| 167 | text | jsx-child | Select destination |
| 177 | text | &lt;label&gt; | Destination City |
| 183 | text | &lt;label&gt; | Tour Name |
| 189 | text | &lt;label&gt; | Price / person ($) |
| 193 | text | &lt;label&gt; | Capacity |
| 197 | text | &lt;label&gt; | Start Date |
| 201 | text | &lt;label&gt; | End Date |
| 208 | text | &lt;label&gt; | Departure Country |
| 212 | text | &lt;label&gt; | Departure City |
| 216 | text | &lt;label&gt; | Meeting Point |
| 222 | text | &lt;label&gt; | Description |
| 227 | text | &lt;label&gt; | Additional Information |
| 233 | text | &lt;label&gt; | Photos ( |
| 238 | a11y | attr:alt | Tour |
| 239 | a11y | attr:aria-label | Remove photo |
| 247 | text | jsx-child | Uploading… |
| 247 | text | jsx-child | Add photos |
| 256 | text | &lt;button&gt; | Cancel |
| 259 | text | jsx-child | Saving… |
| 259 | text | jsx-child | Save Changes |
| 259 | text | jsx-child | Create Tour |

</details>

<details>
<summary><code>libs/components/mypage/agent/MyHotels.tsx</code> — 21 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 54 | text | &lt;h2&gt; | My Hotels |
| 55 | text | &lt;span&gt; | Registered |
| 57 | text | &lt;p&gt; | Overview and manage your luxury properties, room inventories, and nightly rates. |
| 61 | text | &lt;button&gt; | Add Hotel |
| 71 | attr | attr:placeholder | Search properties by name or region... |
| 74 | a11y | attr:title | Text search not supported by backend yet |
| 82 | a11y | attr:title | Type filter not supported by backend yet |
| 84 | text | &lt;option&gt; | All Properties |
| 96 | text | &lt;option&gt; | All Statuses |
| 111 | text | &lt;th&gt; | Property |
| 112 | text | &lt;th&gt; | Type |
| 113 | text | &lt;th&gt; | Nightly Rate |
| 114 | text | &lt;th&gt; | Status |
| 115 | text | &lt;th&gt; | Actions |
| 121 | text | &lt;td&gt; | Loading properties... |
| 125 | text | &lt;td&gt; | No properties found. |
| 155 | text | &lt;span&gt; | / night |
| 167 | text | &lt;button&gt; | Edit |
| 181 | text | &lt;span&gt; | Showing |
| 181 | text | &lt;span&gt; | of |
| 181 | text | &lt;span&gt; | properties |

</details>

<details>
<summary><code>libs/components/mypage/agent/MyTours.tsx</code> — 22 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 53 | text | &lt;h2&gt; | My Tours |
| 54 | text | &lt;span&gt; | Packages |
| 56 | text | &lt;p&gt; | Create, update, and manage your curated expedition packages, itineraries, and seat capacity. |
| 60 | text | &lt;button&gt; | Add Tour |
| 70 | attr | attr:placeholder | Search tour packages by title or location... |
| 73 | a11y | attr:title | Text search not supported by backend yet |
| 81 | text | &lt;option&gt; | All Statuses |
| 96 | text | &lt;th&gt; | Tour Package |
| 97 | text | &lt;th&gt; | Dates |
| 98 | text | &lt;th&gt; | Capacity |
| 99 | text | &lt;th&gt; | Price / Person |
| 100 | text | &lt;th&gt; | Status |
| 101 | text | &lt;th&gt; | Actions |
| 107 | text | &lt;td&gt; | Loading tours... |
| 111 | text | &lt;td&gt; | No tours found. |
| 127 | text | jsx-child | Location not provided |
| 142 | text | &lt;span&gt; | Booked |
| 145 | text | &lt;span&gt; | Seats Left |
| 164 | text | &lt;button&gt; | Edit |
| 178 | text | &lt;span&gt; | Showing |
| 178 | text | &lt;span&gt; | of |
| 178 | text | &lt;span&gt; | tours |

</details>

<details>
<summary><code>libs/components/mypage/agent/Reservations.tsx</code> — 20 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 83 | text | &lt;h2&gt; | Reservations |
| 85 | text | &lt;p&gt; | Manage incoming guest reservations and stay dates across your |
| 95 | attr | attr:placeholder | Search booking ID... |
| 104 | text | &lt;option&gt; | All Statuses |
| 119 | text | &lt;th&gt; | Booking ID |
| 120 | text | &lt;th&gt; | Customer |
| 121 | text | &lt;th&gt; | Listing & Stay |
| 122 | text | &lt;th&gt; | Guests |
| 123 | text | &lt;th&gt; | Total Amount |
| 124 | text | &lt;th&gt; | Status |
| 125 | text | &lt;th&gt; | Action |
| 131 | text | &lt;td&gt; | Loading reservations... |
| 135 | text | &lt;td&gt; | No reservations found. |
| 146 | a11y | attr:alt | customer |
| 148 | brand | jsx-child | US |
| 169 | text | jsx-child | Guests |
| 169 | text | jsx-child | Seats |
| 187 | text | &lt;button&gt; | View |
| 201 | text | &lt;span&gt; | Showing |
| 201 | text | &lt;span&gt; | of |
| 201 | text | &lt;span&gt; | reservations |

</details>

### Admin

<details>
<summary><code>libs/components/admin/UserDrawer.tsx</code> — 46 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 12 | label | return: | years ago |
| 14 | label | return: | months ago |
| 16 | label | return: | days ago |
| 18 | label | return: | hours ago |
| 20 | label | return: | mins ago |
| 21 | label | return: | secs ago |
| 48 | label | var:lastActiveStr | Never |
| 57 | text | &lt;span&gt; | Member Inspection & Management |
| 59 | brand | &lt;span&gt; | AURA- |
| 85 | a11y | attr:alt | Avatar |
| 105 | text | &lt;span&gt; | ID Verified |
| 114 | text | jsx-child | Tour Operator Agent |
| 116 | text | jsx-child | Platform Administrator |
| 117 | text | jsx-child | Standard Member |
| 136 | text | &lt;span&gt; | Specialist |
| 143 | text | jsx-child | Active (Normal) |
| 155 | text | &lt;span&gt; | Auth: |
| 160 | text | &lt;span&gt; | Registered: |
| 168 | text | &lt;span&gt; | Last active: |
| 179 | text | &lt;span&gt; | PUBLISHED ITEMS |
| 186 | text | &lt;span&gt; | Active |
| 189 | text | &lt;div&gt; | properties • |
| 190 | text | &lt;div&gt; | tours |
| 195 | text | &lt;span&gt; | NETWORK |
| 202 | text | &lt;span&gt; | followers |
| 205 | text | &lt;div&gt; | following |
| 210 | text | &lt;span&gt; | COMMUNITY |
| 217 | text | &lt;span&gt; | articles |
| 220 | text | &lt;div&gt; | comments posted |
| 225 | text | &lt;span&gt; | ENGAGEMENT |
| 235 | text | &lt;div&gt; | profile views |
| 249 | text | &lt;button&gt; | Business |
| 263 | text | &lt;h4&gt; | Personal & Contact Information |
| 269 | text | &lt;span&gt; | Full Name |
| 275 | text | &lt;span&gt; | Handle / Slug |
| 281 | text | &lt;span&gt; | Email Address |
| 292 | text | &lt;span&gt; | Primary Phone |
| 304 | text | &lt;span&gt; | Primary Location / Residence |
| 312 | text | jsx-child | Agent Professional Bio |
| 312 | text | jsx-child | Member Bio |
| 315 | text | jsx-child | No biography provided. |
| 323 | text | &lt;h4&gt; | Platform Metrics & Rankings |
| 325 | text | &lt;span&gt; | Verified Data |
| 330 | text | &lt;span&gt; | Member Points |
| 332 | text | &lt;span&gt; | pts |
| 336 | text | &lt;span&gt; | Platform Rank |
| 338 | text | &lt;span&gt; | Level |

</details>

<details>
<summary><code>libs/components/layout/LayoutAdmin.tsx</code> — 17 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 52 | text | &lt;title&gt; | AURA Administration |
| 68 | text | &lt;span&gt; | General |
| 76 | text | &lt;span&gt; | Overview |
| 87 | text | &lt;span&gt; | Notifications |
| 92 | text | &lt;span&gt; | Management |
| 100 | text | &lt;span&gt; | Members |
| 111 | text | &lt;span&gt; | Agent Verification |
| 120 | text | &lt;span&gt; | Hotels |
| 129 | text | &lt;span&gt; | Tours |
| 138 | text | &lt;span&gt; | Destinations |
| 149 | text | &lt;span&gt; | Bookings |
| 154 | text | &lt;span&gt; | Content |
| 162 | text | &lt;span&gt; | Community |
| 171 | text | &lt;span&gt; | Notices |
| 185 | text | &lt;span&gt; | Administration Portal |
| 194 | a11y | attr:aria-label | Notifications |
| 215 | a11y | attr:alt | Profile |

</details>

<details>
<summary><code>pages/_admin/agent-verification/index.tsx</code> — 70 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 112 | label | prop:title | Approve Verification? |
| 113 | label | prop:text | Are you sure you want to approve "${agent.companyName}"? This grants active partner privileges and verified status. |
| 118 | label | prop:confirmButtonText | Approve Verification |
| 119 | label | prop:cancelButtonText | Cancel |
| 127 | alert | call:sweetTopSmallSuccessAlert | Agent approved successfully |
| 143 | label | prop:title | Revoke / Reject Verification |
| 144 | label | prop:text | Specify the reason for rejecting "${agent.companyName}": |
| 146 | label | prop:inputPlaceholder | Enter verification feedback or rejection reason... |
| 150 | label | prop:confirmButtonText | Revoke / Reject |
| 151 | label | prop:cancelButtonText | Cancel |
| 155 | label | return: | Please provide a reason for rejection. |
| 168 | alert | call:sweetTopSmallSuccessAlert | Agent application rejected |
| 192 | label | prop:confirmButtonText | Close Preview |
| 206 | text | &lt;h1&gt; | Agent Verification |
| 208 | text | &lt;p&gt; | Review and verify luxury hotel partners and verified tour expedition operators. |
| 219 | text | &lt;h2&gt; | Requests |
| 220 | text | &lt;span&gt; | Pending Reviews |
| 232 | text | &lt;option&gt; | All Types |
| 233 | text | &lt;option&gt; | HOTEL |
| 234 | text | &lt;option&gt; | TOUR |
| 244 | text | &lt;option&gt; | All Statuses |
| 245 | text | &lt;option&gt; | Pending |
| 247 | text | &lt;option&gt; | Approved |
| 250 | text | &lt;option&gt; | Rejected |
| 283 | text | &lt;button&gt; | Reset |
| 293 | text | &lt;th&gt; | Agent |
| 294 | text | &lt;th&gt; | Company Name |
| 295 | text | &lt;th&gt; | Type |
| 296 | text | &lt;th&gt; | Business Number |
| 297 | text | &lt;th&gt; | Status |
| 298 | text | &lt;th&gt; | Registered Date |
| 299 | text | &lt;th&gt; | Actions |
| 309 | text | &lt;td&gt; | Loading... |
| 322 | text | &lt;td&gt; | No agent verification requests found |
| 370 | text | jsx-child | Unknown |
| 431 | text | &lt;button&gt; | Review |
| 473 | text | &lt;button&gt; | View Details |
| 501 | text | &lt;button&gt; | Approve |
| 526 | text | &lt;button&gt; | Reject |
| 569 | text | &lt;h2&gt; | Agent Verification |
| 585 | text | jsx-child | Approved |
| 588 | text | jsx-child | Rejected |
| 589 | text | jsx-child | Pending Review |
| 597 | a11y | attr:aria-label | Close |
| 623 | brand | jsx-child | JL |
| 636 | text | jsx-child | Julian Laurent |
| 653 | text | &lt;span&gt; | Entity Classification |
| 656 | text | jsx-child | TOUR OPERATOR |
| 660 | text | &lt;span&gt; | Registration Tax ID |
| 662 | text | jsx-child | Not provided |
| 669 | text | &lt;h4&gt; | Corporate Credentials |
| 673 | text | &lt;span&gt; | Registered Business Name |
| 677 | text | jsx-child | Swiss Alpine Atelier & Expeditions AG |
| 682 | text | &lt;span&gt; | Registered Address |
| 685 | text | jsx-child | Bahnhofstrasse 42, 3920 Zermatt, Valais, Switzerland |
| 691 | text | &lt;span&gt; | Managing Director |
| 695 | text | jsx-child | Julian Laurent |
| 699 | text | &lt;span&gt; | Submission Timestamp |
| 705 | text | jsx-child | Oct 24, 2025 · 09:15 AM |
| 714 | text | &lt;h4&gt; | Platform Operational Note |
| 718 | text | jsx-child | Operates 6 luxury tour packages in Swiss Alps (Zermatt, St. Moritz, Grindelwald). Commercial insurance verification document (Allianz Suisse #8491-01) attached and cross-referenced with Swiss Federal Commercial Registry. |
| 725 | text | &lt;h4&gt; | Submitted Documents (2) |
| 736 | text | jsx-child | Trade_Register_Excerpt_${selectedAgent.businessNumber ?.replace…}.pdf |
| 739 | brand | jsx-child | CHE |
| 742 | text | &lt;span&gt; | 1.8 MB · Validated Hash |
| 748 | a11y | attr:title | View Document |
| 754 | brand | attr:onClick &gt; call:handleViewDocument | CHE |
| 775 | text | &lt;span&gt; | Commercial_Liability_Insurance_2025.pdf |
| 778 | text | &lt;span&gt; | 3.2 MB · Official Policy |
| 785 | a11y | attr:title | View Document |
| 811 | text | &lt;span&gt; | Revoke / Reject |
| 821 | text | &lt;span&gt; | Approve Verification |
| 825 | text | &lt;p&gt; | Confirmation dialog will prompt before state change. |

</details>

<details>
<summary><code>pages/_admin/bookings/index.tsx</code> — 19 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 52 | label | return: | Unavailable listing |
| 61 | text | &lt;h1&gt; | Bookings Management |
| 62 | text | &lt;p&gt; | Review real platform reservations and their current booking status. |
| 68 | text | &lt;h2&gt; | Directory |
| 68 | text | &lt;span&gt; | Bookings |
| 72 | text | &lt;option&gt; | All statuses |
| 81 | text | &lt;th&gt; | Booking ID |
| 81 | text | &lt;th&gt; | Customer |
| 81 | text | &lt;th&gt; | Category |
| 81 | text | &lt;th&gt; | Listing |
| 81 | text | &lt;th&gt; | Dates |
| 81 | text | &lt;th&gt; | Total |
| 81 | text | &lt;th&gt; | Status |
| 84 | text | &lt;td&gt; | Loading bookings... |
| 88 | text | &lt;td&gt; | No bookings found. |
| 92 | text | jsx-child | Unknown member |
| 105 | text | &lt;span&gt; | Showing |
| 105 | text | &lt;span&gt; | of |
| 105 | text | &lt;span&gt; | bookings |

</details>

<details>
<summary><code>pages/_admin/community/index.tsx</code> — 46 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 122 | alert | call:sweetTopSmallSuccessAlert | Article status updated! |
| 133 | alert | call:sweetConfirmAlert | Are you sure you want to delete this article? |
| 137 | alert | call:sweetTopSmallSuccessAlert | Article deleted! |
| 147 | alert | call:sweetMixinErrorAlert | No data to export |
| 152 | export | var:headers | Title |
| 153 | export | var:headers | Category |
| 154 | export | var:headers | Status |
| 155 | export | var:headers | Likes |
| 156 | export | var:headers | Views |
| 157 | export | var:headers | Comments |
| 158 | export | var:headers | Created Date |
| 192 | text | &lt;h1&gt; | Community Management |
| 193 | text | &lt;p&gt; | Monitor and moderate community discussions, guides, and news. |
| 200 | text | &lt;h2&gt; | Directory |
| 201 | text | &lt;span&gt; | Articles |
| 209 | text | &lt;option&gt; | All Categories |
| 211 | text | &lt;option&gt; | Destination |
| 213 | text | &lt;option&gt; | Hotel |
| 214 | text | &lt;option&gt; | Tour |
| 215 | text | &lt;option&gt; | Guide |
| 216 | text | &lt;option&gt; | News |
| 222 | text | &lt;option&gt; | All Statuses |
| 223 | text | &lt;option&gt; | Published |
| 224 | text | &lt;option&gt; | Deleted |
| 234 | text | &lt;button&gt; | Reset |
| 244 | text | &lt;th&gt; | Thread Title |
| 245 | text | &lt;th&gt; | Category |
| 246 | text | &lt;th&gt; | Metrics |
| 247 | text | &lt;th&gt; | Status |
| 248 | text | &lt;th&gt; | Created Date |
| 249 | text | &lt;th&gt; | Actions |
| 259 | text | &lt;td&gt; | Loading... |
| 268 | text | &lt;td&gt; | No articles found. |
| 286 | text | &lt;span&gt; | By |
| 286 | text | jsx-child | Unknown |
| 419 | text | &lt;span&gt; | Showing |
| 419 | text | &lt;span&gt; | of |
| 419 | text | &lt;span&gt; | records |
| 467 | text | &lt;span&gt; | Moderate Article |
| 476 | text | &lt;label&gt; | Thread Title |
| 486 | text | &lt;label&gt; | Content |
| 503 | text | &lt;label&gt; | Status |
| 513 | text | &lt;option&gt; | Published |
| 515 | text | &lt;option&gt; | Deleted |
| 526 | text | &lt;button&gt; | Cancel |
| 533 | text | &lt;button&gt; | Save Changes |

</details>

<details>
<summary><code>pages/_admin/cs/index.tsx</code> — 50 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 138 | alert | call:sweetMixinErrorAlert | Please fill in all required fields. |
| 146 | alert | call:sweetTopSmallSuccessAlert | Notice created successfully! |
| 158 | alert | call:sweetTopSmallSuccessAlert | Notice updated successfully! |
| 169 | alert | call:sweetConfirmAlert | Are you sure you want to delete this notice? |
| 173 | alert | call:sweetTopSmallSuccessAlert | Notice deleted! |
| 183 | alert | call:sweetMixinErrorAlert | No notices to export |
| 186 | export | var:headers | Title |
| 186 | export | var:headers | Category |
| 186 | export | var:headers | Status |
| 186 | export | var:headers | Created Date |
| 217 | text | &lt;h1&gt; | Notices Management |
| 218 | text | &lt;p&gt; | Manage system announcements, policies, and inquiries. |
| 237 | text | &lt;button&gt; | Create Notice |
| 247 | text | &lt;h2&gt; | Directory |
| 248 | text | &lt;span&gt; | Notices |
| 255 | attr | attr:placeholder | Search notices... |
| 264 | text | &lt;option&gt; | All Categories |
| 265 | brand | &lt;option&gt; | FAQ |
| 266 | text | &lt;option&gt; | Terms |
| 267 | text | &lt;option&gt; | Inquiry |
| 273 | text | &lt;option&gt; | All Statuses |
| 274 | text | &lt;option&gt; | Active |
| 275 | text | &lt;option&gt; | Hold |
| 276 | text | &lt;option&gt; | Deleted |
| 286 | text | &lt;button&gt; | Reset |
| 297 | text | &lt;th&gt; | Notice Title |
| 298 | text | &lt;th&gt; | Category |
| 299 | text | &lt;th&gt; | Status |
| 300 | text | &lt;th&gt; | Created Date |
| 301 | text | &lt;th&gt; | Actions |
| 311 | text | &lt;td&gt; | Loading... |
| 320 | text | &lt;td&gt; | No notices found. |
| 413 | text | &lt;span&gt; | Showing |
| 413 | text | &lt;span&gt; | of |
| 413 | text | &lt;span&gt; | records |
| 463 | text | jsx-child | Create Notice |
| 463 | text | jsx-child | Edit Notice |
| 474 | text | &lt;label&gt; | Notice Title |
| 479 | attr | attr:placeholder | Enter notice title |
| 490 | text | &lt;label&gt; | Category |
| 502 | brand | &lt;option&gt; | FAQ |
| 503 | text | &lt;option&gt; | Terms |
| 504 | text | &lt;option&gt; | Inquiry |
| 511 | text | &lt;label&gt; | Status |
| 520 | text | &lt;option&gt; | Active |
| 521 | text | &lt;option&gt; | Hold |
| 522 | text | &lt;option&gt; | Deleted |
| 530 | text | &lt;label&gt; | Content |
| 534 | attr | attr:placeholder | Write notice content here... |
| 549 | text | &lt;button&gt; | Cancel |
| 556 | text | jsx-child | Create |
| 556 | text | jsx-child | Save Changes |

</details>

<details>
<summary><code>pages/_admin/destinations/index.tsx</code> — 40 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 107 | alert | call:sweetTopSmallSuccessAlert | Destination status updated! |
| 119 | alert | call:sweetConfirmAlert | Are you sure you want to delete this destination? |
| 124 | alert | call:sweetTopSmallSuccessAlert | Destination deleted! |
| 134 | alert | call:sweetMixinErrorAlert | No data to export |
| 139 | export | var:headers | Name |
| 140 | export | var:headers | Country |
| 141 | export | var:headers | Properties |
| 142 | export | var:headers | Tours |
| 143 | export | var:headers | Status |
| 144 | export | var:headers | Created Date |
| 177 | text | &lt;h1&gt; | Destinations Management |
| 178 | text | &lt;p&gt; | Manage travel hubs, cities, and associated analytics. |
| 185 | text | &lt;h2&gt; | Directory |
| 186 | text | &lt;span&gt; | Destinations |
| 193 | attr | attr:placeholder | Search name, country... |
| 202 | text | &lt;option&gt; | All Statuses |
| 203 | text | &lt;option&gt; | Active |
| 204 | text | &lt;option&gt; | Inactive |
| 214 | text | &lt;button&gt; | Reset |
| 224 | text | &lt;th&gt; | Destination Name |
| 225 | text | &lt;th&gt; | Country |
| 226 | text | &lt;th&gt; | Items Connected |
| 227 | text | &lt;th&gt; | Metrics |
| 228 | text | &lt;th&gt; | Status |
| 229 | text | &lt;th&gt; | Actions |
| 239 | text | &lt;td&gt; | Loading... |
| 248 | text | &lt;td&gt; | No destinations found. |
| 273 | text | &lt;span&gt; | Hotels: |
| 276 | text | &lt;span&gt; | Tours: |
| 385 | text | &lt;span&gt; | Showing |
| 385 | text | &lt;span&gt; | of |
| 385 | text | &lt;span&gt; | records |
| 433 | text | &lt;span&gt; | Moderate Destination |
| 442 | text | &lt;label&gt; | Destination Name |
| 452 | text | &lt;label&gt; | Description |
| 468 | text | &lt;label&gt; | Status |
| 477 | text | &lt;option&gt; | Active |
| 478 | text | &lt;option&gt; | Inactive |
| 489 | text | &lt;button&gt; | Cancel |
| 496 | text | &lt;button&gt; | Save Changes |

</details>

<details>
<summary><code>pages/_admin/index.tsx</code> — 28 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 118 | text | &lt;h1&gt; | System Overview |
| 120 | text | &lt;p&gt; | Real-time marketplace telemetry, operational pipeline, and agent verifications |
| 127 | text | &lt;span&gt; | Live Sync Active |
| 133 | a11y | attr:aria-label | Key Performance Indicators |
| 136 | text | &lt;span&gt; | Total Members |
| 145 | text | &lt;span&gt; | Live |
| 152 | text | &lt;span&gt; | Active Hotels |
| 163 | text | &lt;span&gt; | Live |
| 170 | text | &lt;span&gt; | Active Tours |
| 179 | text | &lt;span&gt; | Live |
| 186 | text | &lt;span&gt; | Total Bookings |
| 195 | text | &lt;span&gt; | Dev |
| 205 | text | &lt;h2&gt; | Recent Bookings |
| 206 | text | &lt;span&gt; | Total |
| 211 | attr | attr:placeholder | Search reference, customer... |
| 220 | text | &lt;th&gt; | Booking ID |
| 221 | text | &lt;th&gt; | Customer |
| 222 | text | &lt;th&gt; | Category |
| 223 | text | &lt;th&gt; | Booking Item |
| 224 | text | &lt;th&gt; | Date |
| 225 | text | &lt;th&gt; | Total |
| 226 | text | &lt;th&gt; | Status |
| 227 | text | &lt;th&gt; | Actions |
| 239 | text | &lt;span&gt; | Loading bookings... |
| 250 | text | &lt;span&gt; | No recent bookings found. |
| 276 | brand | jsx-child | US |
| 280 | text | jsx-child | Unknown |
| 298 | text | jsx-child | Unknown Item |
| 327 | text | &lt;button&gt; | View |

</details>

<details>
<summary><code>pages/_admin/notifications/index.tsx</code> — 23 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 124 | text | &lt;h1&gt; | Notifications |
| 125 | text | &lt;p&gt; | Agent applications, booking updates and other platform events addressed to administrators. |
| 131 | text | &lt;h2&gt; | Inbox |
| 131 | text | &lt;span&gt; | Unread |
| 135 | text | &lt;option&gt; | All notifications |
| 136 | text | &lt;option&gt; | Unread only |
| 141 | text | &lt;button&gt; | Mark all as read |
| 148 | text | &lt;th&gt; | Type |
| 148 | text | &lt;th&gt; | Notification |
| 148 | text | &lt;th&gt; | From |
| 148 | text | &lt;th&gt; | Date |
| 148 | text | &lt;th&gt; | Status |
| 148 | text | &lt;th&gt; | Actions |
| 151 | text | &lt;td&gt; | Loading notifications... |
| 155 | text | &lt;td&gt; | No notifications found. |
| 166 | text | jsx-child | System |
| 168 | text | jsx-child | UNREAD |
| 168 | text | jsx-child | READ |
| 171 | text | &lt;button&gt; | Open |
| 172 | a11y | attr:aria-label | Mark notification as read |
| 185 | text | &lt;span&gt; | Showing |
| 185 | text | &lt;span&gt; | of |
| 185 | text | &lt;span&gt; | notifications |

</details>

<details>
<summary><code>pages/_admin/properties/index.tsx</code> — 83 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 91 | label | prop:title | Update Property Status |
| 92 | label | prop:text | Select new status for "${property.propertyName}": |
| 95 | label | prop:ACTIVE | Active |
| 96 | label | prop:PENDING | Pending |
| 97 | label | prop:INACTIVE | Inactive |
| 98 | label | prop:REJECTED | Rejected |
| 104 | label | prop:confirmButtonText | Save Status |
| 105 | label | prop:cancelButtonText | Cancel |
| 113 | alert | call:sweetTopSmallSuccessAlert | Property status updated successfully! |
| 125 | label | var:actionName | Deactivate |
| 125 | label | var:actionName | Activate |
| 128 | label | prop:title | ${actionName} Property? |
| 130 | label | prop:text | Deactivating "${property.propertyName}" will remove it from guest search results immediately. |
| 131 | label | prop:text | Activating "${property.propertyName}" will make it visible to guests. |
| 136 | label | prop:confirmButtonText | Yes, ${actionName} |
| 137 | label | prop:cancelButtonText | Cancel |
| 147 | alert | call:sweetTopSmallSuccessAlert | Property ${actionName.toLowerCase()}d successfully! |
| 160 | label | prop:title | Agent Contact |
| 161 | label | prop:text | Agent contact for ${name \|\| 'this property'}: ${selectedProperty?.memberData?.memberPh…} |
| 161 | label | prop:text | this property |
| 174 | alert | call:sweetTopSmallSuccessAlert | Property status updated! |
| 184 | alert | call:sweetConfirmAlert | Are you sure you want to delete this property? |
| 187 | alert | call:sweetTopSmallSuccessAlert | Property deleted! |
| 197 | alert | call:sweetMixinErrorAlert | No data to export |
| 200 | export | var:headers | Name |
| 200 | export | var:headers | Type |
| 200 | export | var:headers | City |
| 200 | export | var:headers | Price |
| 200 | export | var:headers | Status |
| 200 | export | var:headers | Created Date |
| 229 | text | &lt;h1&gt; | Hotels & Properties Management |
| 230 | text | &lt;p&gt; | Review, approve, and moderate property listings. |
| 238 | text | &lt;h2&gt; | Directory |
| 239 | text | &lt;span&gt; | Properties |
| 246 | attr | attr:placeholder | Search city... |
| 252 | text | &lt;option&gt; | All Statuses |
| 253 | text | &lt;option&gt; | Active |
| 254 | text | &lt;option&gt; | Pending |
| 255 | text | &lt;option&gt; | Inactive |
| 256 | text | &lt;option&gt; | Rejected |
| 260 | text | &lt;button&gt; | Reset |
| 270 | text | &lt;th&gt; | Property Name |
| 271 | text | &lt;th&gt; | Location |
| 272 | text | &lt;th&gt; | Price (Per Night) |
| 273 | text | &lt;th&gt; | Metrics |
| 274 | text | &lt;th&gt; | Status |
| 275 | text | &lt;th&gt; | Actions |
| 282 | text | &lt;td&gt; | Loading... |
| 288 | text | &lt;td&gt; | No properties found. |
| 379 | text | &lt;span&gt; | Showing |
| 379 | text | &lt;span&gt; | of |
| 379 | text | &lt;span&gt; | records |
| 420 | text | &lt;h2&gt; | Property Details |
| 436 | a11y | attr:aria-label | Close |
| 460 | text | jsx-child | Property |
| 464 | text | &lt;p&gt; | ID: # |
| 467 | text | jsx-child | Location not provided |
| 488 | brand | jsx-child | JL |
| 502 | text | jsx-child | Julian Laurent |
| 507 | text | &lt;span&gt; | Verified Agent • |
| 509 | text | jsx-child | ${selectedProperty.memberData.memberNick} Atelier |
| 510 | text | jsx-child | Swiss Alpine Atelier |
| 517 | a11y | attr:title | Contact Agent |
| 534 | text | &lt;span&gt; | Property Type |
| 539 | text | jsx-child | Hotel |
| 545 | text | &lt;span&gt; | Location |
| 547 | text | jsx-child | Location not provided |
| 553 | text | &lt;span&gt; | Base Price |
| 556 | text | &lt;span&gt; | / night |
| 562 | text | &lt;span&gt; | Rating |
| 570 | text | &lt;span&gt; | reviews) |
| 577 | text | &lt;span&gt; | Status |
| 592 | text | jsx-child | Active |
| 598 | text | &lt;span&gt; | Rooms / Units |
| 601 | text | jsx-child | ${selectedProperty.bedrooms} Suites |
| 602 | text | jsx-child | ${selectedProperty.maxGuests \|\| 2} Guests Max |
| 609 | text | &lt;h4&gt; | Summary |
| 612 | text | jsx-child | A secluded luxury sanctuary nestled in the Swiss Alps facing the Matterhorn, offering private thermal baths, helipad access, and Michelin-starred dining. |
| 624 | text | &lt;span&gt; | View Full Property |
| 633 | text | &lt;button&gt; | Edit Details |
| 643 | text | jsx-child | Deactivate Property |
| 644 | text | jsx-child | Activate Property |
| 648 | text | jsx-child | Deactivation removes property from guest search results immediately. |
| 649 | text | jsx-child | Activation makes property visible to guest search results immediately. |

</details>

<details>
<summary><code>pages/_admin/reviews/index.tsx</code> — 21 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 21 | alert | call:sweetMixinErrorAlert | Global Comments API is not supported by the backend. |
| 26 | alert | call:sweetMixinErrorAlert | This action is not supported by the backend API. |
| 33 | text | &lt;h1&gt; | Comments & Reviews Management |
| 35 | text | &lt;p&gt; | Moderate user feedback, property reviews, and community comments. |
| 56 | text | &lt;h2&gt; | Comments |
| 71 | text | &lt;h2&gt; | Reviews |
| 79 | attr | attr:placeholder | Search ${activeTab}... |
| 85 | text | &lt;option&gt; | All Contexts |
| 95 | text | &lt;button&gt; | Reset |
| 105 | text | &lt;th&gt; | Author |
| 106 | text | &lt;th&gt; | Content |
| 107 | text | &lt;th&gt; | Context (Target) |
| 108 | text | &lt;th&gt; | Rating |
| 109 | text | &lt;th&gt; | Date |
| 110 | text | &lt;th&gt; | Actions |
| 134 | text | &lt;h3&gt; | Unsupported Feature |
| 136 | text | &lt;p&gt; | The backend does not support fetching all |
| 137 | text | &lt;p&gt; | globally without a specific target ID. |
| 148 | text | &lt;span&gt; | Showing |
| 148 | text | &lt;span&gt; | of |
| 148 | text | &lt;span&gt; | records |

</details>

<details>
<summary><code>pages/_admin/settings/index.tsx</code> — 6 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 7 | alert | call:sweetMixinErrorAlert | Settings API is not supported by the backend. |
| 13 | text | &lt;h1&gt; | Platform Settings |
| 14 | text | &lt;p&gt; | Configure global platform variables, tax rates, and API keys. |
| 19 | text | &lt;button&gt; | Save Changes |
| 27 | text | &lt;h3&gt; | Unsupported Feature |
| 28 | text | &lt;p&gt; | The AURA backend does not currently have APIs for Global Settings. |

</details>

<details>
<summary><code>pages/_admin/support/index.tsx</code> — 41 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 125 | alert | call:sweetTopSmallSuccessAlert | Reply sent to member! |
| 125 | alert | call:sweetTopSmallSuccessAlert | Ticket updated! |
| 137 | alert | call:sweetMixinErrorAlert | No tickets to export |
| 142 | export | var:headers | Subject |
| 143 | export | var:headers | Name |
| 144 | export | var:headers | Email |
| 145 | export | var:headers | Category |
| 146 | export | var:headers | Status |
| 147 | export | var:headers | Created Date |
| 180 | text | &lt;h1&gt; | Support Tickets Management |
| 181 | text | &lt;p&gt; | Handle member inquiries, bug reports, and assistance requests. |
| 189 | text | &lt;h2&gt; | Directory |
| 190 | text | &lt;span&gt; | Tickets |
| 197 | attr | attr:placeholder | Search tickets... |
| 208 | text | &lt;option&gt; | All Categories |
| 220 | text | &lt;option&gt; | All Statuses |
| 235 | text | &lt;button&gt; | Reset |
| 245 | text | &lt;th&gt; | Ticket Subject |
| 246 | text | &lt;th&gt; | Submitter |
| 247 | text | &lt;th&gt; | Category |
| 248 | text | &lt;th&gt; | Status |
| 249 | text | &lt;th&gt; | Created Date |
| 250 | text | &lt;th&gt; | Actions |
| 260 | text | &lt;td&gt; | Loading... |
| 269 | text | &lt;td&gt; | No support tickets found. |
| 340 | text | &lt;span&gt; | Showing |
| 340 | text | &lt;span&gt; | of |
| 340 | text | &lt;span&gt; | records |
| 390 | text | &lt;span&gt; | Ticket # |
| 400 | text | &lt;label&gt; | Subject |
| 408 | text | &lt;label&gt; | Submitter |
| 418 | text | &lt;label&gt; | Category / Created |
| 427 | text | &lt;label&gt; | Message |
| 442 | text | &lt;label&gt; | Attachment |
| 450 | a11y | attr:alt | attachment |
| 463 | text | &lt;label&gt; | Status |
| 480 | text | &lt;label&gt; | Reply to Member |
| 483 | attr | attr:placeholder | Write a reply. The member will receive it as a notification. |
| 489 | text | &lt;span&gt; | Last replied: |
| 502 | text | &lt;button&gt; | Cancel |
| 509 | text | &lt;button&gt; | Save Changes |

</details>

<details>
<summary><code>pages/_admin/tours/index.tsx</code> — 43 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 102 | alert | call:sweetTopSmallSuccessAlert | Tour status updated! |
| 112 | alert | call:sweetConfirmAlert | Are you sure you want to delete this tour? |
| 115 | alert | call:sweetTopSmallSuccessAlert | Tour deleted! |
| 125 | alert | call:sweetMixinErrorAlert | No data to export |
| 130 | export | var:headers | Name |
| 131 | export | var:headers | Price |
| 132 | export | var:headers | Capacity |
| 133 | export | var:headers | Start Date |
| 134 | export | var:headers | End Date |
| 135 | export | var:headers | Status |
| 136 | export | var:headers | Created Date |
| 170 | text | &lt;h1&gt; | Tours Management |
| 171 | text | &lt;p&gt; | Review, approve, and moderate guided tours and packages. |
| 178 | text | &lt;h2&gt; | Directory |
| 179 | text | &lt;span&gt; | Tours |
| 186 | attr | attr:placeholder | Search departure city... |
| 195 | text | &lt;option&gt; | All Statuses |
| 196 | text | &lt;option&gt; | Active |
| 197 | text | &lt;option&gt; | Pending |
| 198 | text | &lt;option&gt; | Inactive |
| 199 | text | &lt;option&gt; | Rejected |
| 209 | text | &lt;button&gt; | Reset |
| 219 | text | &lt;th&gt; | Tour Name |
| 220 | text | &lt;th&gt; | Schedule |
| 221 | text | &lt;th&gt; | Price |
| 222 | text | &lt;th&gt; | Capacity |
| 223 | text | &lt;th&gt; | Status |
| 224 | text | &lt;th&gt; | Actions |
| 234 | text | &lt;td&gt; | Loading... |
| 243 | text | &lt;td&gt; | No tours found. |
| 344 | text | &lt;span&gt; | Showing |
| 344 | text | &lt;span&gt; | of |
| 344 | text | &lt;span&gt; | records |
| 392 | text | &lt;span&gt; | Moderate Tour |
| 401 | text | &lt;label&gt; | Tour Name |
| 411 | text | &lt;label&gt; | Description |
| 427 | text | &lt;label&gt; | Status |
| 434 | text | &lt;option&gt; | Active |
| 435 | text | &lt;option&gt; | Pending |
| 436 | text | &lt;option&gt; | Inactive |
| 437 | text | &lt;option&gt; | Rejected |
| 448 | text | &lt;button&gt; | Cancel |
| 455 | text | &lt;button&gt; | Save Changes |

</details>

<details>
<summary><code>pages/_admin/users/index.tsx</code> — 38 strings</summary>

| Line | Kind | Where | Text |
| ---: | --- | --- | --- |
| 103 | alert | call:sweetTopSmallSuccessAlert | Status updated to ${newStatus} |
| 130 | alert | call:sweetMixinErrorAlert | No members data to export |
| 135 | export | var:headers | Nick |
| 136 | export | var:headers | Full Name |
| 137 | export | var:headers | Email |
| 138 | export | var:headers | Phone |
| 139 | export | var:headers | Role |
| 140 | export | var:headers | Status |
| 141 | export | var:headers | Registered At |
| 176 | text | &lt;h1&gt; | Members Management |
| 178 | text | &lt;p&gt; | Manage all registered platform accounts, access roles, and activity records. |
| 189 | text | &lt;h2&gt; | Directory |
| 190 | text | &lt;span&gt; | Members |
| 197 | attr | attr:placeholder | Search name, handle, email... |
| 206 | text | &lt;option&gt; | All Roles |
| 207 | text | &lt;option&gt; | User |
| 208 | text | &lt;option&gt; | Agent |
| 209 | text | &lt;option&gt; | Admin |
| 215 | text | &lt;option&gt; | All Statuses |
| 216 | text | &lt;option&gt; | Active |
| 217 | text | &lt;option&gt; | Banned |
| 227 | text | &lt;button&gt; | Reset |
| 238 | text | &lt;th&gt; | Member |
| 239 | text | &lt;th&gt; | Contact Info |
| 240 | text | &lt;th&gt; | Role |
| 241 | text | &lt;th&gt; | Status |
| 242 | text | &lt;th&gt; | Registration Date |
| 243 | text | &lt;th&gt; | Actions |
| 253 | text | &lt;span&gt; | No members found! |
| 262 | label | jsx-child &gt; var:initials | User |
| 348 | text | jsx-child | Banned |
| 369 | text | &lt;button&gt; | Inspect |
| 421 | text | &lt;button&gt; | View Details |
| 452 | text | &lt;button&gt; | Activate |
| 484 | text | &lt;button&gt; | Suspend |
| 501 | text | &lt;span&gt; | Showing |
| 501 | text | &lt;span&gt; | of |
| 501 | text | &lt;span&gt; | records |

</details>

## Appendix C — Raw enum values rendered as text (62 sites)

| Location | Rendered expression |
| --- | --- |
| `libs/components/admin/UserDrawer.tsx:134` | `{selectedMember.memberType}` |
| `libs/components/admin/UserDrawer.tsx:142` | `{selectedMember.memberStatus === MemberStatus.ACTIVE ? "Active (Normal)" : selectedMember.memberStatus}` |
| `libs/components/admin/UserDrawer.tsx:155` | `{selectedMember.memberAuthType}` |
| `libs/components/destination/detail/DestinationTopStays.tsx:107` | `{property.propertyDesc \|\| property.propertyType}` |
| `libs/components/homepage/CommunityCurators.tsx:171` | `{curator.memberType}` |
| `libs/components/homepage/Experiences.tsx:102` | `{tour.tourStatus}` |
| `libs/components/homepage/Hero.tsx:200` | `{type \|\| t("home.hero.allStays")}  — type holds a PropertyType enum value` |
| `libs/components/homepage/Hero.tsx:229` | `&lt;span&gt;{t}&lt;/span&gt;  — t is the STAY_TYPES.map((t) =&gt; …) parameter (PropertyType), shadowing the i18n t` |
| `libs/components/layout/LayoutAdmin.tsx:206` | `{user.memberType}` |
| `libs/components/member/MemberArticles.tsx:145` | `{article.articleCategory \|\| 'Uncategorized'}` |
| `libs/components/mypage/agent/AgentPropertyForm.tsx:181` | `Object.values(PropertyType) → &lt;option&gt;` |
| `libs/components/mypage/agent/MyHotels.tsx:86` | `Object.values(PropertyType) → &lt;option&gt;{pt.replace(/_/g, ' ')}&lt;/option&gt;` |
| `libs/components/mypage/agent/MyHotels.tsx:97` | `Object.values(PropertyStatus) → &lt;option&gt;` |
| `libs/components/mypage/agent/MyHotels.tsx:149` | `{(prop.propertyType \|\| '').replace(/_/g, ' ')}` |
| `libs/components/mypage/agent/MyHotels.tsx:161` | `{prop.propertyStatus}` |
| `libs/components/mypage/agent/MyTours.tsx:82` | `Object.values(TourStatus) → &lt;option&gt;` |
| `libs/components/mypage/agent/MyTours.tsx:158` | `{tour.tourStatus}` |
| `libs/components/mypage/agent/Reservations.tsx:105` | `Object.values(BookingStatus) → &lt;option&gt;` |
| `libs/components/mypage/agent/Reservations.tsx:181` | `{booking.bookingStatus}` |
| `libs/components/mypage/AgentApplicationPage.tsx:150` | `{latestApp.agentType}` |
| `libs/components/mypage/AgentApplicationPage.tsx:303` | `{app.agentType}` |
| `libs/components/mypage/MyProfileArticles.tsx:186` | `{article.articleCategory}` |
| `libs/components/mypage/MyProfileBookings.tsx:365` | `{selectedBooking.bookingStatus}` |
| `libs/components/mypage/MyProfileHeader.tsx:80` | `{profile?.memberType \|\| "USER"}` |
| `libs/components/property/detail/PropertyHeader.tsx:48` | `{property.propertyType}` |
| `libs/components/property/detail/PropertyHeader.tsx:49` | `{property.propertyStatus}` |
| `libs/components/property/detail/PropertyOverview.tsx:93` | `{property.propertyType}` |
| `libs/components/property/detail/SimilarProperties.tsx:113` | `{item.propertyType}` |
| `libs/components/property/PropertyCard.tsx:138` | `{property.propertyType}` |
| `libs/components/tour/detail/SimilarTours.tsx:40` | `{tour.tourStatus}` |
| `libs/components/tour/detail/TourHeader.tsx:51` | `{tour.tourStatus}` |
| `libs/components/tour/detail/TourOverview.tsx:79` | `{tour.tourStatus}` |
| `libs/components/tour/TourCard.tsx:30` | `{tour.tourStatus}` |
| `pages/_admin/agent-verification/index.tsx:396` | `{agent.agentType}` |
| `pages/_admin/agent-verification/index.tsx:416` | `{agent.verificationStatus}` |
| `pages/_admin/agent-verification/index.tsx:655` | `{selectedAgent.agentType?.replace(/_/g, " ") \|\| "TOUR OPERATOR"}` |
| `pages/_admin/bookings/index.tsx:73` | `Object.values(BookingStatus) → &lt;option&gt;{value}&lt;/option&gt;` |
| `pages/_admin/bookings/index.tsx:93` | `{booking.bookingCategory}` |
| `pages/_admin/bookings/index.tsx:97` | `{booking.bookingStatus}` |
| `pages/_admin/community/index.tsx:292` | `{article.articleCategory}` |
| `pages/_admin/community/index.tsx:360` | `{article.articleStatus}` |
| `pages/_admin/cs/index.tsx:341` | `{notice.noticeCategory}` |
| `pages/_admin/cs/index.tsx:353` | `{notice.noticeStatus}` |
| `pages/_admin/destinations/index.tsx:331` | `{destination.destinationStatus}` |
| `pages/_admin/index.tsx:291` | `{booking.bookingCategory}` |
| `pages/_admin/index.tsx:322` | `{booking.bookingStatus}` |
| `pages/_admin/notifications/index.tsx:161` | `{notification.notificationType}` |
| `pages/_admin/properties/index.tsx:300` | `{property.propertyType}` |
| `pages/_admin/properties/index.tsx:331` | `{property.propertyStatus}` |
| `pages/_admin/properties/index.tsx:433` | `{selectedProperty.propertyStatus}` |
| `pages/_admin/properties/index.tsx:460` | `{selectedProperty.propertyType?.replace(/_/g, ' ') \|\| 'Property'}` |
| `pages/_admin/properties/index.tsx:536` | `{selectedProperty.propertyType ? selectedProperty.propertyType.charAt(0).toUpperCase() + selectedProperty.propertyType.slice(1).toLowerCase().replace(` |
| `pages/_admin/properties/index.tsx:589` | `{selectedProperty.propertyStatus ? selectedProperty.propertyStatus.charAt(0).toUpperCase() + selectedProperty.propertyStatus.slice(1).toLowerCase() : ` |
| `pages/_admin/support/index.tsx:209` | `Object.values(SupportCategory) → &lt;option&gt;` |
| `pages/_admin/support/index.tsx:221` | `Object.values(SupportStatus) → &lt;option&gt;{status.replace("_", " ")}&lt;/option&gt;` |
| `pages/_admin/support/index.tsx:292` | `{ticket.ticketCategory}` |
| `pages/_admin/support/index.tsx:302` | `{ticket.ticketStatus.replace("_", " ")}` |
| `pages/_admin/support/index.tsx:419` | `{selectedTicket.ticketCategory}` |
| `pages/_admin/support/index.tsx:471` | `Object.values(SupportStatus) → &lt;option&gt;{status.replace("_", " ")}&lt;/option&gt;` |
| `pages/_admin/tours/index.tsx:290` | `{tour.tourStatus}` |
| `pages/_admin/users/index.tsx:335` | `{member.memberType}` |
| `pages/_admin/users/index.tsx:347` | `{member.memberStatus === MemberStatus.BLOCKED ? "Banned" : member.memberStatus}` |

## Appendix D — Locale-insensitive date and number formatting

### D.1 Locale pinned to English (15)

| Location | Call |
| --- | --- |
| `libs/components/admin/UserDrawer.tsx:161` | `new Date(selectedMember.createdAt).toLocaleDateString( "en-US", { month: "short", day: "numeric", year: "numeric" }, )` |
| `libs/components/chat/ChatSidebar.tsx:28` | `new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' })` |
| `libs/components/chat/ChatThread.tsx:26` | `new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" })` |
| `libs/components/chat/ChatThread.tsx:30` | `new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric", })` |
| `libs/components/community/CommunityCard.tsx:27` | `new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC', })` |
| `libs/components/community/detail/CommunityDetailHeader.tsx:20` | `new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC", })` |
| `libs/components/mypage/MyProfileArticles.tsx:72` | `d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", })` |
| `libs/components/mypage/MyProfileBookings.tsx:94` | `new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2, })` |
| `libs/components/mypage/MyProfileBookings.tsx:100` | `new Date(inDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })` |
| `libs/components/mypage/MyProfileBookings.tsx:102` | `new Date(outDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })` |
| `libs/components/mypage/WishlistPlaceCard.tsx:178` | `new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2, })` |
| `libs/components/tour/detail/TourComments.tsx:148` | `new Date( comment.createdAt, ).toLocaleDateString("en-US", { month: "short", year: "numeric", })` |
| `libs/utils.ts:20` | `date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })` |
| `pages/_admin/bookings/index.tsx:24` | `date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })` |
| `pages/_admin/notifications/index.tsx:29` | `date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })` |

### D.2 No locale argument — runtime default instead of the app locale (65)

<details>
<summary>Show all</summary>

| Location | Call |
| --- | --- |
| `libs/components/common/LikeButton.tsx:37` | `count.toLocaleString()` |
| `libs/components/destination/detail/DestinationAbout.tsx:55` | `(destination.destinationViews ?? 0).toLocaleString()` |
| `libs/components/destination/detail/DestinationAbout.tsx:60` | `likesCount.toLocaleString()` |
| `libs/components/destination/detail/DestinationAbout.tsx:65` | `commentsCount.toLocaleString()` |
| `libs/components/destination/detail/DestinationAbout.tsx:71` | `reviewsTotal.toLocaleString()` |
| `libs/components/destination/detail/DestinationAbout.tsx:101` | `(destination.destinationProperties ?? 0).toLocaleString()` |
| `libs/components/destination/detail/DestinationAbout.tsx:110` | `(destination.destinationTours ?? 0).toLocaleString()` |
| `libs/components/destination/detail/DestinationPopularTours.tsx:120` | `priceUSD.toLocaleString()` |
| `libs/components/destination/detail/DestinationTopStays.tsx:113` | `priceUSD.toLocaleString()` |
| `libs/components/homepage/Experiences.tsx:14` | `price.toLocaleString()` |
| `libs/components/homepage/LiveDispatches.tsx:17` | `views.toLocaleString()` |
| `libs/components/homepage/SpecialStays.tsx:19` | `price.toLocaleString()` |
| `libs/components/mypage/MyProfileWishlist.tsx:198` | `new Date( item.tourStartDate, ).toLocaleDateString()` |
| `libs/components/mypage/MyProfileWishlist.tsx:200` | `new Date( item.tourEndDate, ).toLocaleDateString()` |
| `libs/components/mypage/agent/MyHotels.tsx:154` | `Number(prop.pricePerNight \|\| 0).toLocaleString()` |
| `libs/components/mypage/agent/MyTours.tsx:151` | `Number(tour.tourPrice \|\| 0).toLocaleString()` |
| `libs/components/mypage/agent/Reservations.tsx:174` | `Number(booking.bookingTotalPrice \|\| 0).toLocaleString()` |
| `libs/components/property/Filter.tsx:255` | `PRICE_FILTER_MIN.toLocaleString()` |
| `libs/components/property/Filter.tsx:262` | `PRICE_FILTER_MAX.toLocaleString()` |
| `libs/components/property/Filter.tsx:263` | `maxPrice.toLocaleString()` |
| `libs/components/property/PropertyCard.tsx:153` | `property.pricePerNight?.toLocaleString()` |
| `libs/components/property/detail/PropertyOverview.tsx:102` | `property.propertyLikes.toLocaleString()` |
| `libs/components/property/detail/PropertyOverview.tsx:103` | `property.propertyViews.toLocaleString()` |
| `libs/components/property/detail/PropertyOverview.tsx:104` | `property.propertyBookings.toLocaleString()` |
| `libs/components/property/detail/PropertyReservationWidget.tsx:124` | `pricePerNight.toLocaleString()` |
| `libs/components/property/detail/PropertyReservationWidget.tsx:171` | `pricePerNight.toLocaleString()` |
| `libs/components/property/detail/PropertyReservationWidget.tsx:171` | `total.toLocaleString()` |
| `libs/components/property/detail/PropertyReservationWidget.tsx:173` | `total.toLocaleString()` |
| `libs/components/property/detail/SimilarProperties.tsx:117` | `item.pricePerNight?.toLocaleString()` |
| `libs/components/tour/TourCard.tsx:57` | `tour.tourPrice.toLocaleString()` |
| `libs/components/tour/TourFilter.tsx:196` | `PRICE_FILTER_MIN.toLocaleString()` |
| `libs/components/tour/TourFilter.tsx:197` | `PRICE_FILTER_MAX.toLocaleString()` |
| `libs/components/tour/TourFilter.tsx:203` | `PRICE_FILTER_MIN.toLocaleString()` |
| `libs/components/tour/TourFilter.tsx:208` | `maxPrice.toLocaleString()` |
| `libs/components/tour/detail/SimilarTours.tsx:40` | `tour.tourPrice.toLocaleString()` |
| `libs/components/tour/detail/TourOverview.tsx:86` | `tour.tourLikes.toLocaleString()` |
| `libs/components/tour/detail/TourOverview.tsx:87` | `tour.tourViews.toLocaleString()` |
| `libs/components/tour/detail/TourReservationWidget.tsx:68` | `tour.tourPrice.toLocaleString()` |
| `libs/components/tour/detail/TourReservationWidget.tsx:83` | `tour.tourPrice.toLocaleString()` |
| `libs/components/tour/detail/TourReservationWidget.tsx:83` | `totalPrice.toLocaleString()` |
| `libs/components/tour/detail/TourReservationWidget.tsx:83` | `totalPrice.toLocaleString()` |
| `pages/_admin/agent-verification/index.tsx:421` | `new Date(agent.createdAt).toLocaleDateString()` |
| `pages/_admin/bookings/index.tsx:29` | `amount.toLocaleString()` |
| `pages/_admin/community/index.tsx:168` | `new Date(a.createdAt).toLocaleDateString()` |
| `pages/_admin/community/index.tsx:365` | `new Date(article.createdAt).toLocaleDateString()` |
| `pages/_admin/cs/index.tsx:192` | `new Date(n.createdAt).toLocaleDateString()` |
| `pages/_admin/cs/index.tsx:358` | `new Date(notice.createdAt).toLocaleDateString()` |
| `pages/_admin/destinations/index.tsx:153` | `new Date(d.createdAt).toLocaleDateString()` |
| `pages/_admin/index.tsx:142` | `totalMembers.toLocaleString()` |
| `pages/_admin/index.tsx:159` | `activeProperties.toLocaleString()` |
| `pages/_admin/index.tsx:176` | `activeTours.toLocaleString()` |
| `pages/_admin/index.tsx:192` | `totalBookings.toLocaleString()` |
| `pages/_admin/index.tsx:309` | `booking.bookingTotalPrice.toLocaleString()` |
| `pages/_admin/properties/index.tsx:208` | `new Date(p.createdAt).toLocaleDateString()` |
| `pages/_admin/properties/index.tsx:310` | `property.pricePerNight.toLocaleString()` |
| `pages/_admin/properties/index.tsx:556` | `selectedProperty.pricePerNight?.toLocaleString()` |
| `pages/_admin/support/index.tsx:156` | `new Date(t.createdAt).toLocaleDateString()` |
| `pages/_admin/support/index.tsx:307` | `new Date(ticket.createdAt).toLocaleDateString()` |
| `pages/_admin/support/index.tsx:421` | `new Date(selectedTicket.createdAt).toLocaleString()` |
| `pages/_admin/support/index.tsx:490` | `new Date(selectedTicket.repliedAt).toLocaleString()` |
| `pages/_admin/tours/index.tsx:271` | `tour.tourPrice.toLocaleString()` |
| `pages/checkout/index.tsx:82` | `paymentAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })` |
| `pages/checkout/index.tsx:329` | `price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })` |
| `pages/checkout/index.tsx:330` | `totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })` |
| `pages/checkout/index.tsx:335` | `totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })` |

</details>

### D.3 `moment` display formats and relative times, never localized (16)

| Location | Call |
| --- | --- |
| `libs/components/chat/ChatDossier.tsx:201` | `moment(isNaN(Number(member.createdAt)) ? member.createdAt : Number(member.createdAt)).format('MMMM YYYY')` |
| `libs/components/destination/detail/DestinationReviews.tsx:235` | `moment(isNaN(Number(rev.createdAt)) ? rev.createdAt : Number(rev.createdAt)).fromNow()` |
| `libs/components/member/MemberArticles.tsx:127` | `moment(isNaN(Number(article.createdAt)) ? article.createdAt : Number(article.createdAt)).format('MMM DD, YYYY')` |
| `libs/components/member/MemberSidebar.tsx:31` | `moment(isNaN(Number(member.createdAt)) ? member.createdAt : Number(member.createdAt)).format("MMMM YYYY")` |
| `libs/components/mypage/AgentApplicationPage.tsx:153` | `moment(latestApp.createdAt).format("MMM DD, YYYY")` |
| `libs/components/mypage/AgentApplicationPage.tsx:302` | `moment(app.createdAt).format("MMM DD, YYYY")` |
| `libs/components/mypage/MyProfileNotifications.tsx:277` | `moment(isNaN(Number(notif.createdAt)) ? notif.createdAt : Number(notif.createdAt)).fromNow()` |
| `libs/components/mypage/agent/MyTours.tsx:135` | `moment(tour.tourStartDate).format('MMM DD')` |
| `libs/components/mypage/agent/MyTours.tsx:135` | `moment(tour.tourEndDate).format('MMM DD, YYYY')` |
| `libs/components/mypage/agent/Reservations.tsx:162` | `moment(booking.checkIn).format('MMM DD, YYYY')` |
| `libs/components/mypage/agent/Reservations.tsx:163` | `moment(booking.checkOut).format('MMM DD, YYYY')` |
| `pages/_admin/agent-verification/index.tsx:702` | `moment(selectedAgent.createdAt).format( "MMM DD, YYYY · hh:mm A", )` |
| `pages/_admin/index.tsx:303` | `moment(booking.createdAt).format("MMM DD, YYYY")` |
| `pages/_admin/tours/index.tsx:263` | `moment(tour.tourStartDate).format("MMM DD")` |
| `pages/_admin/tours/index.tsx:264` | `moment(tour.tourEndDate).format("MMM DD, YYYY")` |
| `pages/_admin/users/index.tsx:355` | `moment(member.createdAt).format("MMM DD, YYYY")` |

## Appendix E — Plurals and sentences built by concatenation (18)

| Location | Pattern |
| --- | --- |
| `libs/components/community/detail/CommunityDetailComments.tsx:40` | `return ˋ${diffWeeks} week${diffWeeks &gt; 1 ? "s" : ""} agoˋ;` |
| `libs/components/property/detail/PropertyComments.tsx:112` | `{displayTotal} evaluation{displayTotal === 1 ? "" : "s"} for{" "}` |
| `libs/components/property/detail/PropertyGallery.tsx:63` | `&lt;span&gt;View all {galleryImages.length} photo{galleryImages.length === 1 ? '' : 's'}&lt;/span&gt;` |
| `libs/components/property/detail/PropertyOverview.tsx:102` | `&lt;div className="spec-chip"&gt;&lt;span className="material-symbols-outlined spec-icon"&gt;favorite&lt;/span&gt;&lt;div className="spec-details"&gt;&lt;spa` |
| `libs/components/property/detail/PropertyReservationWidget.tsx:148` | `l"&gt;Guests&lt;/label&gt;&lt;div className="picker-val"&gt;{guestCount} {guestCount === 1 ? 'Guest' : 'Guests'}&lt;/div&gt;&lt;/div&gt;` |
| `libs/components/property/detail/PropertyReservationWidget.tsx:155` | `&lt;span&gt;{guestOption} {guestOption === 1 ? 'Guest' : 'Guests'}&lt;/span&gt;` |
| `libs/components/property/detail/PropertyReservationWidget.tsx:171` | `down-label"&gt;${pricePerNight.toLocaleString()} × {nights} night{nights === 1 ? '' : 's'}&lt;/span&gt;&lt;span className="breakd` |
| `libs/components/tour/detail/TourComments.tsx:107` | `{displayTotal} evaluation{displayTotal === 1 ? "" : "s"} for{" "}` |
| `libs/components/tour/detail/TourGallery.tsx:23` | `&lt;button type="button" className="view-all-photos-btn" onClick={() =&gt; setActiveIndex(0)}&gt;&lt;span className="material-symbols-outlined` |
| `libs/components/tour/detail/TourOverview.tsx:86` | `&lt;div className="meta-badge-chip"&gt;&lt;span className="material-symbols-outlined badge-icon"&gt;favorite&lt;/span&gt;&lt;div className="badge-detai` |
| `libs/components/tour/detail/TourReservationWidget.tsx:73` | `&lt;/span&gt;&lt;span className="seats-alert-badge"&gt;{seatsLeft} seat{seatsLeft === 1 ? '' : 's'} availa` |
| `libs/components/tour/detail/TourReservationWidget.tsx:83` | `&lt;div className="itemized-breakdown"&gt;&lt;div className="breakdown-row"&gt;&lt;span className="breakdown-label"&gt;${tour.tourPrice.toLocaleStri` |
| `libs/utils.ts:28` | `return ˋ${days} day${days === 1 ? '' : 's'}ˋ;` |
| `pages/checkout/index.tsx:325` | `{isProperty ? ˋ${nights} nightsˋ : 'Tour'} • {guests} {Number(guests) === 1 ? 'guest' : 'guests'}&lt;/p&gt;` |
| `pages/community/index.tsx:130` | `subtitle: ˋ${count} published propert${count === 1 ? "y" : "ies"}ˋ,` |
| `pages/community/index.tsx:159` | `subtitle: ˋ${count} published tour${count === 1 ? "" : "s"}ˋ,` |
| `pages/property/index.tsx:339` | `Total {total} propert{total &gt; 1 ? "ies" : "y"} available` |
| `pages/tour/index.tsx:278` | `Total {total} journey{total &gt; 1 ? 's' : ''} available` |

## Appendix F — Exception and backend messages shown to the user (66)

<details>
<summary>Show all</summary>

| Location | Call |
| --- | --- |
| `libs/components/account/SignIn.tsx:85` | `sweetMixinErrorAlert(err?.message \|\| 'Login failed. Please check your credentials.')` |
| `libs/components/account/SignUp.tsx:113` | `sweetMixinErrorAlert( err?.message \|\| "Registration failed. Please check your information.", )` |
| `libs/components/chat/ChatDossier.tsx:70` | `sweetErrorAlert(error instanceof Error ? error.message : 'Unable to update follow status.')` |
| `libs/components/chat/ChatMessenger.tsx:127` | `setDirectChatError(error instanceof Error ? error.message : 'Unable to open this conversation.')` |
| `libs/components/chat/ChatMessenger.tsx:240` | `setDeleteError(error instanceof Error ? error.message : 'Unable to delete this conversation.')` |
| `libs/components/community/CommunitySidebar.tsx:108` | `sweetMixinErrorAlert(err?.message \|\| 'Action failed.')` |
| `libs/components/community/WriteStoryModal.tsx:101` | `sweetMixinErrorAlert(err.message \|\| 'Image upload failed')` |
| `libs/components/community/WriteStoryModal.tsx:154` | `sweetMixinErrorAlert(err.message \|\| Messages.error1)` |
| `libs/components/community/detail/CommunityDetailComments.tsx:136` | `sweetMixinErrorAlert(err.message \|\| Messages.error1)` |
| `libs/components/cs/CsContactForm.tsx:108` | `sweetMixinErrorAlert(err.message \|\| 'Attachment upload failed')` |
| `libs/components/cs/CsContactForm.tsx:149` | `sweetMixinErrorAlert(err.message)` |
| `libs/components/destination/detail/DestinationReviews.tsx:85` | `sweetErrorAlert(err.message)` |
| `libs/components/destination/detail/DestinationTravelers.tsx:20` | `sweetMixinErrorAlert(error instanceof Error ? error.message : 'Unable to update follow status.')` |
| `libs/components/member/MemberArticles.tsx:73` | `sweetMixinErrorAlert(err?.message \|\| 'Action failed.')` |
| `libs/components/member/MemberFollowers.tsx:80` | `sweetMixinErrorAlert(err?.message \|\| 'Action failed.')` |
| `libs/components/member/MemberFollowing.tsx:80` | `sweetMixinErrorAlert(err?.message \|\| 'Action failed.')` |
| `libs/components/member/MemberHeader.tsx:69` | `sweetMixinErrorAlert(err?.message \|\| 'Action failed.')` |
| `libs/components/member/MemberProducts.tsx:70` | `sweetMixinErrorAlert(err.message \|\| 'Action failed')` |
| `libs/components/member/MemberProducts.tsx:85` | `sweetMixinErrorAlert(err.message \|\| 'Action failed')` |
| `libs/components/mypage/AgentApplicationPage.tsx:85` | `sweetMixinErrorAlert(err.message \|\| "Failed to submit application.")` |
| `libs/components/mypage/MyProfileArticles.tsx:100` | `sweetMixinErrorAlert(err.message \|\| "Failed to delete article")` |
| `libs/components/mypage/MyProfileBookings.tsx:68` | `sweetMixinErrorAlert(err.message \|\| 'Cancellation failed.')` |
| `libs/components/mypage/MyProfileFollowers.tsx:73` | `sweetMixinErrorAlert(err.message \|\| "Operation failed.")` |
| `libs/components/mypage/MyProfileFollowing.tsx:61` | `sweetMixinErrorAlert(err.message \|\| 'Operation failed.')` |
| `libs/components/mypage/MyProfileSettings.tsx:81` | `sweetMixinErrorAlert(err.message \|\| 'Image upload failed')` |
| `libs/components/mypage/MyProfileSettings.tsx:116` | `sweetMixinErrorAlert(err.message \|\| "Update failed.")` |
| `libs/components/mypage/MyProfileWishlist.tsx:118` | `sweetMixinErrorAlert(err.message \|\| "Action failed.")` |
| `libs/components/mypage/agent/AgentPropertyForm.tsx:96` | `sweetMixinErrorAlert(err?.message \|\| 'Image upload failed')` |
| `libs/components/mypage/agent/AgentPropertyForm.tsx:145` | `sweetMixinErrorAlert(err?.message \|\| 'Could not save the property.')` |
| `libs/components/mypage/agent/AgentTourForm.tsx:85` | `sweetMixinErrorAlert(err?.message \|\| 'Image upload failed')` |
| `libs/components/mypage/agent/AgentTourForm.tsx:143` | `sweetMixinErrorAlert(err?.message \|\| 'Could not save the tour.')` |
| `libs/components/property/detail/PropertyComments.tsx:93` | `sweetErrorAlert(err.message \|\| "Failed to post comment.")` |
| `libs/components/property/detail/PropertyOverview.tsx:74` | `sweetErrorAlert(error instanceof Error ? error.message : 'Unable to update follow status.')` |
| `libs/components/property/detail/SimilarProperties.tsx:50` | `sweetErrorAlert(err.message \|\| 'Error occurred')` |
| `libs/components/tour/detail/SimilarTours.tsx:36` | `sweetErrorAlert(error instanceof Error ? error.message : 'Unable to update favorite.')` |
| `libs/components/tour/detail/TourComments.tsx:90` | `sweetErrorAlert(err.message \|\| "Failed to post comment.")` |
| `libs/components/tour/detail/TourOverview.tsx:62` | `sweetErrorAlert(error instanceof Error ? error.message : 'Unable to update follow status.')` |
| `libs/sweetAlert.ts:6` | `Swal.fire({ icon: 'error', text: err?.message \|\| Messages.error1, showConfirmButton: false, })` |
| `pages/_admin/agent-verification/index.tsx:131` | `sweetMixinErrorAlert(err.message)` |
| `pages/_admin/agent-verification/index.tsx:172` | `sweetMixinErrorAlert(err.message)` |
| `pages/_admin/community/index.tsx:127` | `sweetMixinErrorAlert(err.message)` |
| `pages/_admin/community/index.tsx:140` | `sweetMixinErrorAlert(err.message)` |
| `pages/_admin/cs/index.tsx:163` | `sweetMixinErrorAlert(err.message)` |
| `pages/_admin/cs/index.tsx:176` | `sweetMixinErrorAlert(err.message)` |
| `pages/_admin/destinations/index.tsx:112` | `sweetMixinErrorAlert(err.message)` |
| `pages/_admin/destinations/index.tsx:127` | `sweetMixinErrorAlert(err.message)` |
| `pages/_admin/properties/index.tsx:117` | `sweetMixinErrorAlert(err.message)` |
| `pages/_admin/properties/index.tsx:151` | `sweetMixinErrorAlert(err.message)` |
| `pages/_admin/properties/index.tsx:179` | `sweetMixinErrorAlert(err.message)` |
| `pages/_admin/properties/index.tsx:190` | `sweetMixinErrorAlert(err.message)` |
| `pages/_admin/support/index.tsx:131` | `sweetMixinErrorAlert(err.message)` |
| `pages/_admin/tours/index.tsx:107` | `sweetMixinErrorAlert(err.message)` |
| `pages/_admin/tours/index.tsx:118` | `sweetMixinErrorAlert(err.message)` |
| `pages/_admin/users/index.tsx:113` | `sweetMixinErrorAlert(err.message)` |
| `pages/checkout/index.tsx:57` | `sweetErrorAlert(err.message \|\| 'Payment failed')` |
| `pages/community/detail.tsx:105` | `sweetMixinErrorAlert(err.message \|\| 'Error occurred while liking')` |
| `pages/community/detail.tsx:129` | `sweetMixinErrorAlert(err.message \|\| 'Unable to update follow status.')` |
| `pages/community/index.tsx:315` | `sweetMixinErrorAlert(err.message \|\| "Error occurred while liking")` |
| `pages/destination/detail.tsx:179` | `sweetErrorAlert(err.message)` |
| `pages/destination/detail.tsx:192` | `sweetErrorAlert(err.message)` |
| `pages/destination/detail.tsx:205` | `sweetErrorAlert(err.message)` |
| `pages/destination/index.tsx:164` | `sweetMixinErrorAlert(err.message)` |
| `pages/property/detail.tsx:51` | `sweetErrorAlert(err.message \|\| 'Error occurred')` |
| `pages/property/index.tsx:145` | `sweetMixinErrorAlert(err.message)` |
| `pages/tour/detail.tsx:51` | `sweetErrorAlert(err.message \|\| 'Error occurred')` |
| `pages/tour/index.tsx:123` | `sweetMixinErrorAlert(err.message)` |

</details>

## Appendix G — `<title>` and `<meta>` elements (39)

| Location | Element |
| --- | --- |
| `libs/components/layout/LayoutAdmin.tsx:52` | `&lt;title&gt;AURA Administration&lt;/title&gt;` |
| `libs/components/layout/LayoutBasic.tsx:17` | `&lt;title&gt;AURA Hotels &amp; Sanctuaries&lt;/title&gt;` |
| `libs/components/layout/LayoutBasic.tsx:18` | `&lt;meta name="title" content="AURA Hotels" /&gt;` |
| `libs/components/layout/LayoutBasic.tsx:33` | `&lt;title&gt;AURA Hotels &amp; Sanctuaries&lt;/title&gt;` |
| `libs/components/layout/LayoutBasic.tsx:34` | `&lt;meta name="title" content="AURA Hotels" /&gt;` |
| `libs/components/layout/LayoutHome.tsx:17` | `&lt;title&gt;AURA Travel — Go Somewhere Extraordinary&lt;/title&gt;` |
| `libs/components/layout/LayoutHome.tsx:18` | `&lt;meta name="title" content="AURA Travel" /&gt;` |
| `libs/components/layout/LayoutHome.tsx:33` | `&lt;title&gt;AURA Travel — Go Somewhere Extraordinary&lt;/title&gt;` |
| `libs/components/layout/LayoutHome.tsx:34` | `&lt;meta name="title" content="AURA Travel" /&gt;` |
| `pages/account/join.tsx:43` | `&lt;title&gt; {activeView === 'signin' ? 'AURA Travel — Sign In' : 'AURA Travel — Sign Up'} &lt;/title&gt;` |
| `pages/account/join.tsx:48` | `&lt;meta name="description" content="Sign in or register for your AURA Travel luxury exploration account." /&gt;` |
| `pages/account/login.tsx:14` | `&lt;title&gt;AURA Travel — Sign In&lt;/title&gt;` |
| `pages/account/login.tsx:15` | `&lt;meta name="description" content="Sign in to your AURA Travel account." /&gt;` |
| `pages/account/signup.tsx:14` | `&lt;title&gt;AURA Travel — Sign Up&lt;/title&gt;` |
| `pages/account/signup.tsx:15` | `&lt;meta name="description" content="Create your AURA Travel luxury exploration account." /&gt;` |
| `pages/auth/kakao/callback.tsx:50` | `&lt;title&gt;Kakao sign-in — AURORA&lt;/title&gt;` |
| `pages/auth/telegram/callback.tsx:77` | `&lt;title&gt;Telegram sign-in — AURORA&lt;/title&gt;` |
| `pages/chat/index.tsx:25` | `&lt;title&gt;Messages — AURORA Travel Marketplace&lt;/title&gt;` |
| `pages/chat/index.tsx:26` | `&lt;meta name="description" content="Real-time community and direct messages for authenticated AURORA members." /&gt;` |
| `pages/checkout/index.tsx:225` | `&lt;title&gt;AURA Travel — Secure Checkout&lt;/title&gt;` |
| `pages/community/detail.tsx:148` | `&lt;title&gt; {article?.articleTitle ? ˋ${article.articleTitle} — AURA Travel Communityˋ : 'Community Story — AURA Travel'} &lt;/title&gt;` |
| `pages/community/detail.tsx:153` | `&lt;meta name="description" content={ article?.articleContent?.slice(0, 160) \|\| 'Read full traveler dispatches and expeditions on AURA.' } /&gt;` |
| `pages/community/index.tsx:324` | `&lt;title&gt;AURA — Travelers Community & Global Dispatches&lt;/title&gt;` |
| `pages/community/index.tsx:325` | `&lt;meta name="description" content="Stories, itineraries, and insider dispatches from verified explorers and world-class hosts across six continents." /` |
| `pages/destination/detail.tsx:241` | `&lt;title&gt;AURA \| Discover {destination.destinationName} ({destination.destinationCountry})&lt;/title&gt;` |
| `pages/destination/detail.tsx:242` | `&lt;meta name="title" content={ˋDiscover ${destination.destinationName} — Sanctuaries & Expeditions \| AURA Travelˋ} /&gt;` |
| `pages/destination/detail.tsx:246` | `&lt;meta name="description" content={destination.destinationDesc \|\| 'Curated global destination sanctuaries.'} /&gt;` |
| `pages/destination/index.tsx:176` | `&lt;title&gt;AURA \| Explore the World - Curated Destinations&lt;/title&gt;` |
| `pages/destination/index.tsx:177` | `&lt;meta name="title" content="Explore the World — Global Sanctuaries &amp; Territories \| AURA Travel" /&gt;` |
| `pages/member/index.tsx:62` | `&lt;title&gt;{member ? ˋ${memberTitle} — AURA Member Profileˋ : 'Member — AURA'}&lt;/title&gt;` |
| `pages/member/index.tsx:63` | `&lt;meta name="description" content={ member?.memberDesc \|\| 'Explore curated journals, monographs, and architectural chronicles on AURA.' } /&gt;` |
| `pages/mypage/index.tsx:93` | `&lt;title&gt;{getPageTitle()}&lt;/title&gt;` |
| `pages/mypage/index.tsx:94` | `&lt;meta name="description" content="Manage your AURA Travel profile, bookings, articles, and wishlist." /&gt;` |
| `pages/property/detail.tsx:103` | `&lt;title&gt;{property.propertyName} \| AURA Luxury Sanctuary&lt;/title&gt;` |
| `pages/property/detail.tsx:104` | `&lt;meta name="description" content={property.propertyDesc \|\| 'Curated luxury architectural sanctuary by AURA.'} /&gt;` |
| `pages/tour/detail.tsx:98` | `&lt;title&gt;{tour.tourName} \| AURA Curated Expedition&lt;/title&gt;` |
| `pages/tour/detail.tsx:99` | `&lt;meta name="description" content={tour.tourDesc \|\| 'Curated high-alpine expedition by AURA.'} /&gt;` |
| `pages/tour/index.tsx:190` | `&lt;title&gt;AURA \| Curated Tours &amp; Expeditions&lt;/title&gt;` |
| `pages/tour/index.tsx:191` | `&lt;meta name="title" content="AURA Tours & Expeditions" /&gt;` |
