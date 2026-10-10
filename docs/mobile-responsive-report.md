# AURORA Mobile Responsive Implementation Report

Date: 2026-10-11

## Scope and architecture

The implementation keeps the existing Pages Router and `#pc-wrap` / `#mobile-wrap` split. Mobile rules remain isolated in `scss/mobile/`; no existing desktop SCSS rule was edited as part of this mobile pass. Existing uncommitted work was preserved.

`useDeviceDetect()` now responds to the actual `767px` breakpoint as well as mobile user agents, so device emulation and viewport resizing select the intended DOM tree. Widths above `767px` continue to use the desktop experience; no tablet-only design system was added.

## Pages inspected

- Home: `/`
- Authentication: `/account/join`, `/account/login`, `/account/signup`, Kakao and Telegram callbacks
- Hotels: `/property`, `/property/detail`
- Tours: `/tour`, `/tour/detail`
- Destinations: `/destination`, `/destination/detail`
- Community: `/community`, `/community/detail`
- Customer service: `/cs`
- Checkout and Stripe container: `/checkout`
- Member/profile: `/member`, `/mypage`
- Chat: `/chat`
- Admin: `/_admin` plus agent verification, bookings, community, CS/notices, destinations, notifications, properties, reviews, settings, support, tours, and users

All 31 user-facing and admin route URLs listed above returned HTTP 200 from the optimized production server during route smoke testing.

## Mobile SCSS

Existing files reused:

- `scss/mobile/main.scss`
- `scss/mobile/general.scss`
- `scss/mobile/responsive.scss`
- `scss/mobile/member.scss`
- `scss/mobile/common/navbar.scss`

New partials:

- `scss/mobile/foundations.scss` — sizing, safe areas, touch targets, header drawer, footer, overflow protection
- `scss/mobile/homepage.scss` — hero, search controls, sections, Swiper containers, destination cards
- `scss/mobile/commerce.scss` — listings, filter bottom sheets, cards, galleries, detail widgets, comments, calendars
- `scss/mobile/content.scss` — destinations, community, article detail, CS/FAQ/contact form
- `scss/mobile/account-profile.scss` — auth, member/My Page, agent tools, chat, checkout, Stripe containers
- `scss/mobile/dashboards.scss` — mobile admin navigation, cards, tables, drawers, forms, and modals

All new partials are imported once, at the end of `scss/mobile/main.scss`, after the existing mobile layers.

## Components modified

- `libs/hooks/useDeviceDetect.ts` — live `max-width: 767px` detection with resize updates
- `libs/components/Top.tsx` — accessible mobile drawer, route highlighting, authenticated/admin links, EN/KO/UZ selector, Escape and backdrop dismissal, body scroll lock
- `libs/components/common/MobileFilterPanel.tsx` — reusable accessible mobile filter bottom sheet; filters remain instant/reactive and keep existing URL/API behavior
- `pages/property/index.tsx` and `pages/tour/index.tsx` — use the filter bottom sheet without changing GraphQL variables or filtering handlers
- `libs/components/layout/LayoutAdmin.tsx` — accessible mobile admin navigation drawer
- `pages/checkout/index.tsx` — selects `#mobile-wrap` on phones instead of always forcing `#pc-wrap`
- `libs/i18n/messages/en.json`, `ko.json`, `uz.json` — navigation accessibility labels

## Breakpoints and viewport behavior

- Primary mobile boundary: `767px`
- Narrow-phone refinement: `359px`
- Profile metric refinement: `430px`
- Safe-area insets are applied to fixed navigation, drawers, bottom sheets, and payment modal edges.
- Grids collapse to one column on phones; horizontally dense tabs/chips use contained touch scrolling.
- Admin/agent tables retain all columns and actions inside contained horizontal scrollers instead of shrinking into unreadable columns.

The rules were authored for the requested 320, 360, 375, 390, and 430px widths. A browser automation surface was unavailable in this session, so those widths were not visually screenshot-tested and are not claimed as visually verified.

## Page-by-page completion status

| Area | Implementation status | Verification status |
| --- | --- | --- |
| Header/navigation/footer | Complete mobile layout and interactions | Type/build/route verified; visual browser QA pending |
| Home | Mobile hero, search layout, sections, cards, and Swiper containment | Type/build/route verified; live API and visual QA pending |
| Hotel listing | Mobile cards, sorting, pagination, reactive filter bottom sheet | Type/build/route verified; live API interaction pending |
| Property detail | Gallery, content cards, calendar, reviews, booking and payment modal | Type/build/route verified; live availability/payment not executed |
| Tour listing/detail | Mobile filters, cards, gallery, booking, related content, comments | Type/build/route verified; live API interaction pending |
| Destinations | Listing/detail sections and horizontal related-content rails | Type/build/route verified; live API interaction pending |
| Community | Header, tabs, feed, detail, comments, authoring modal | Type/build/route verified; mutation interaction pending |
| Customer service | FAQ, help content, contact form layout | Type/build/route verified; submission not executed |
| Authentication | Login/signup keyboard-safe single-column layout | Type/build/route verified; OAuth/login not executed |
| My Page/member/agent | Mobile profile header, tabs, cards, forms, tables | Type/build/route verified; authenticated data pending |
| Chat | Phone-sized conversation/thread/composer layout | Type/build/route verified; WebSocket interaction pending |
| Checkout/Stripe | Responsive summary, form container, safe payment modal | Type/build/route verified; no payment attempted |
| Admin | Mobile navigation, filters, tables, drawers, forms, modals | Type/build/route verified; authenticated actions pending |

## Motion and Swiper

- Existing Framer Motion and Swiper integrations were retained.
- Mobile Swiper containers allow natural horizontal card exposure without page-level overflow.
- Drawer and bottom-sheet transitions use only transform/opacity.
- All added transitions are disabled by `prefers-reduced-motion`.
- No looping animation, parallax, or additional scroll listener was introduced.

## Internationalization

- No new visible mobile control text is hardcoded outside brand text.
- Navigation accessibility labels were added in English, Korean, and Uzbek.
- `npm run i18n:check` passed with 1,794 aligned keys across all three dictionaries.
- The checker reports 20 existing unused keys; this is informational and not a dictionary mismatch.

## Desktop protection

- New customer-facing rules are scoped under `#mobile-wrap#mobile-wrap`.
- Admin changes are scoped to `@media (max-width: 767px)`; the new trigger/backdrop nodes are hidden by default on desktop.
- No desktop SCSS file was changed by this implementation.
- Production compilation passed, but a before/after desktop screenshot comparison could not be performed because no browser automation surface was available. Desktop visual regression therefore remains pending rather than claimed as passed.

## Verification results

- `npx tsc --noEmit`: passed
- `npm run i18n:check`: passed
- Mobile Sass standalone compilation: passed (only the repository's existing `@import` deprecation notice)
- `npm run lint`: passed with warnings; warnings are existing image-optimization and hook-dependency guidance
- `npm run build`: passed; 136 static pages generated
- Production HTTP smoke test: 31/31 route URLs returned 200
- `git diff --check`: the new mobile work is clean; the command still reports a pre-existing extra blank line at EOF in `scss/pc/cs/cs.scss`

Build-time Google Font optimization was skipped because outbound font access was unavailable; this did not fail the build.

## Remaining verification issues

1. Real browser visual checks at 320, 360, 375, 390, 430, 1280, 1440, and 1920px remain pending because this session exposed no usable browser surface.
2. The backend GraphQL service at `localhost:3007` was unavailable, so live result sets, authenticated states, booking availability, mutations, WebSocket chat, and admin actions were not exercised.
3. Stripe was deliberately not submitted. Only responsive structure and successful production compilation were verified.
4. Existing lint warnings should be handled separately; none was introduced as a build-blocking error.
