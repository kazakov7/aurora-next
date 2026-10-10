# AURORA i18n audit

## Scope

The frontend contains 126 page/component files and approximately 1,189 hardcoded text-node matches. Database-sourced marketplace content is excluded: property, tour, destination, article, notice, chat and profile free text remain in their original language by design.

## Implemented foundation

- Pages Router locale routing: `en` (default), `ko`, `uz`.
- Runtime translation provider with English fallback, interpolation and persisted locale preference.
- Accessible language switching in the global header and footer, preserving pathname, query parameters and dynamic route IDs.
- Shared navigation, footer, booking, payment, auth and common terminology dictionaries in all three languages.
- The complete Home screen is localized: hero/search, destinations, stays, tours, community curators, travel partners and live dispatches.
- The document language attribute is rendered from the active Next.js locale.
- USD is intentionally fixed; it is not a locale preference.

## Translation dictionary organization

| Namespace | Coverage target |
| --- | --- |
| `common` | shared actions, loading, empty/error states, counts and units |
| `navigation` | header, sidebar and route labels |
| `home` | hero, featured cards and search |
| `auth` | join, login, validation and account messages |
| `hotels` | hotel listing, filters, cards and detail UI |
| `tours` | tour listing, filters, cards and detail UI |
| `destinations` | destination index/detail UI and gallery labels |
| `community` | article listing, detail, reactions and comments |
| `chat` | inbox, direct/global chat and empty states |
| `profile` | My Page, followers, favorites and travel history |
| `booking` | status labels, reservation actions and booking states |
| `payment` | checkout, payment confirmation and errors |
| `notifications` | inbox, read state and system messages |
| `support` | service center, tickets, FAQ and notices |
| `agent` | listing forms, reservations and agent dashboard |
| `admin` | dashboard, moderation, tables and dialogs |
| `validation` / `errors` | client-side labels and user-safe failures |

## File audit and proposed keys

| Area | Representative files | Key families |
| --- | --- | --- |
| Global shell | `libs/components/Top.tsx`, `Footer.tsx`, `GlobalSearch.tsx` | `navigation.*`, `language.*`, `footer.*`, `common.search` |
| Home | `pages/index.tsx`, `libs/components/homepage/*` | `home.*`, `common.*`, `booking.*` |
| Hotels | `pages/property/*`, `libs/components/property/*` | `hotels.*`, `common.*`, `booking.reserve` |
| Tours | `pages/tour/*`, `libs/components/tour/*` | `tours.*`, `common.*`, `booking.bookNow` |
| Destinations | `pages/destination/*`, `libs/components/destination/*` | `destinations.*`, `common.*` |
| Community | `pages/community/*`, `libs/components/community/*` | `community.*`, `common.*` |
| Account and profile | `pages/account/*`, `libs/components/mypage/*` | `auth.*`, `profile.*`, `booking.*` |
| Checkout | `pages/checkout/index.tsx`, payment widgets | `payment.*`, `booking.*`, `validation.*` |
| Chat and support | `pages/chat.tsx`, `pages/cs/*`, `libs/components/cs/*` | `chat.*`, `support.*`, `notifications.*` |
| Agent and admin | `pages/_admin/*`, agent profile components | `agent.*`, `admin.*`, `common.*` |

## Intentional exclusions

- GraphQL enum values, mutation variables and API error codes.
- Database-originated names, descriptions, messages and other free text.
- AURORA brand name, proper names, technical identifiers and image file paths.
- USD numeric values and Stripe/payment calculations.

## Terminology normalization

- `Book now` is `booking.bookNow`.
- `Reserve` is `booking.reserve`.
- Booking statuses use `booking.confirmed`, `booking.pending`, `booking.cancelled` and `booking.completed`.
- `View all`, `Save`, `Cancel`, `Close`, `Loading` and `No results` use `common.*` keys.

## Current migration status

- The runtime, global shell, and all seven Home sections are migrated.
- Customer Support, account, listing/detail, chat, My Page, agent and admin screens still contain legacy literals and require their own semantic namespaces before this can accurately be called a complete frontend migration.
- The audit remains intentionally explicit about this gap: a dictionary key-parity check cannot prove that every rendered literal has been migrated.

## Validation status

- Dictionary parity is maintained by matching top-level key trees in `en.json`, `ko.json` and `uz.json`.
- `npm run i18n:check` and `npx tsc --noEmit` pass for the currently migrated scope. Production build compilation and static-page generation pass; font optimization warnings are expected when Google Fonts cannot be reached in the local environment.
- Any new UI text must use a semantic key from the namespaces above rather than a new English literal.
