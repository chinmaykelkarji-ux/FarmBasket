# FarmBasket — customer web app (MVP)

**Fresh vegetables, the way you want them.** Customers choose the size, colour/ripeness and variety of each vegetable; the store picks and quality-checks to that preference. Launch city: Belagavi, Karnataka.

This repository contains the customer-facing app only. There is no farmer app, admin tooling or real backend yet.

## Run

```bash
npm install
npm run dev          # http://localhost:5173
```

Other scripts:

| Command | What it does |
| --- | --- |
| `npm run build` | Type-check and build for production (`dist/`) |
| `npm run preview` | Serve the production build |
| `npm test` | Unit tests for variant, pricing, search, filter and order-status logic |
| `npm run e2e` | Runs the full 23-step customer journey in headless Chromium (needs `npm run dev` running; set `CHROMIUM_PATH` if Playwright's browser isn't installed, `WIDTH=360` to test other widths, `SHOTS=dir` for screenshots) |

## Routes

| Route | Page |
| --- | --- |
| `/` | Home: hero, categories, your usuals, fresh today, popular, smart basket, freshness promise |
| `/vegetables` | Catalogue with category, type, size, colour, price and sort filters (all in the URL) |
| `/search` | Search with suggestions, recent and popular searches |
| `/product/:slug` | Product detail: recommended choice, your usual, variant picker, quantity, sold-out alternatives |
| `/cart` | Basket with "Change preference" editing, free-delivery progress, bill summary |
| `/checkout` | Address, delivery slot, payment, note for the picker |
| `/orders/:id/confirmed` | Order confirmation |
| `/orders/:id` | Live tracking, quality feedback after delivery, buy again |
| `/orders/:id/report` | Report a quality problem |
| `/orders` | Order history with buy again |
| `/basket` | Build my basket (family-size weekly basket) |
| `/profile`, `/profile/preferences`, `/profile/addresses` | Account, saved vegetable preferences, addresses |
| `/help`, `/quality`, `/about` | Help, quality guarantee, about |

## Architecture

```
src/
  config/      brand, commerce rules, env — rebrand or retune here
  data/        seeded catalogue (41 SKUs across 23 products) and categories — MOCK data
  types/       domain types (Product, ProductVariant, Order, QualityFeedback, …)
  services/    service layer the UI calls: product, cart, customer, preference, order, feedback, slot, analytics
  features/    pure business logic: variant resolution, pricing, filters, basket rules, validation
  state/       React providers: catalogue, cart, preferences, toasts
  components/  ui primitives, layout, product, cart, checkout, orders, produce illustrations
  pages/       route components (lazy-loaded)
  i18n/        centralised copy (English only; add kn/hi dictionaries later)
supabase/schema.sql   draft tables for when a backend is added
scripts/e2e-flow.mjs  end-to-end journey test
```

- **Data model.** A product (for example Tomato) has attributes (colour/ripeness, size, variety) and variants for the combinations that actually exist. Each variant has its own price, stock and note. Not every combination exists. When a customer picks one that doesn't, `resolveSelection` keeps their choice and moves to the nearest real variant, and the page tells them what changed.
- **Mock backend.** Services store "tables" in `localStorage` through `services/db.ts`, and add some latency so the skeleton loaders show. UI code never reads storage directly. To switch to a real backend, reimplement each service with Supabase or API calls; the pages don't need to change.
- **Preferences ("your usual").** These use fixed rules, not ML. A preference the customer saves always wins. Otherwise the last ordered variant and quantity for each product becomes a learned preference.
- **Order tracking.** Status is worked out from a timeline of timestamped events. For the prototype the stages run faster than real life (about 2.5 minutes to "delivered"). A small "Delivery simulation" panel lets a researcher move the order forward. Turn it off with `commerce.prototypeControls`.
- **Analytics.** `track()` logs these events to the console in dev and keeps a local event log, which you can export from Profile → Research session tools: `product_viewed`, `product_customized`, `variant_selected`, `add_to_cart`, `cart_updated`, `checkout_started`, `order_placed`, `preference_saved`, `quality_issue_reported`, `reorder_clicked`.
- **Imagery.** All produce is drawn as vector illustrations, so no image can fail to load, and choosing a colour, ripeness or size updates the picture straight away. Photos of your own graded stock should replace them later.

## Security notes

- No secrets in the frontend. Only public `VITE_*` values belong in `.env` (see `.env.example`). Never put a Supabase service-role key in this app.
- Client-side totals are for display only. `orderService.place` re-prices lines from variant IDs. A real backend must do the same and must never trust prices sent by the client.
- Inputs are validated: phone, pincode serviceability, and length limits on notes and feedback.

## Known limitations

- No real authentication, backend, payments or delivery tracking. Everything lives in the browser, so data doesn't carry across devices.
- Prices and stock are seeded mock data. Red Large tomato is deliberately sold out so you can see the sold-out state.
- Card payment is marked "coming soon". UPI and cash are both paid on delivery.
- There's no photo upload for quality reports yet.
