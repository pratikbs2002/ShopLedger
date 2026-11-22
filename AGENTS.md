# ShopLedger

## Stack

- Node.js with CommonJS, Express 4, and body-parser for JSON requests.
- The server serves plain HTML, CSS, and JavaScript from `public/`. The browser calls the API with XMLHttpRequest.
- Application data is stored in `data/db.json`.

## Module map

- `routes/customers.js` lists Khata customers and records settlements.
- `routes/orders.js` lists, retrieves, places, and cancels orders.
- `routes/products.js` serves the product catalog and active coupons.
- `routes/reports.js` serves dashboard and GST reconciliation reports, pricing previews, and admin exports.
- `lib/coupons.js` normalizes coupon codes, validates them, and calculates discounts.
- `lib/dates.js` formats today's date, normalizes date keys, and determines the fiscal year.
- `lib/inventory.js` finds products, checks stock, reserves or releases it, and summarizes inventory.
- `lib/invoice.js` computes invoice figures and renders printable HTML.
- `lib/ledger.js` manages Khata customer lookup, order debits and reversals, and settlements.
- `lib/orders.js` creates, retrieves, filters, and cancels order records.
- `lib/pricing.js` computes order subtotals, discounts, GST, and totals.
- `lib/reports.js` builds dashboard and GST reconciliation summaries.
- `lib/store.js` reads and writes the JSON database and appends audit entries.
- `lib/tax.js` resolves GST rates and splits GST into CGST and SGST.

## Commands

- Start with `npm start`, which runs `node server.js` on port 3000 by default. Set `PORT` to override it.
- Run tests with `node --test`. It currently discovers zero tests. The `npm test` script is a failing placeholder.

## Rules

1. Write characterization tests before changing behaviour.
2. Change only the module(s) the ticket is about.
3. Tests never read or write `data/db.json`. Use in-memory data.
4. Add no dependencies.
5. Make the smallest fix that works.

## Current ticket

The invoice total and GST breakdown do not match what the customer was billed.
Allowed files are `lib/invoice.js` and, only if truly needed, `lib/tax.js`.