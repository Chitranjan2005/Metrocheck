# MetroCheck frontend

React (Vite) frontend for the Legal Metrology compliance checker. Talks to
the `metrocheck-backend` API for OCR, the rule engine, storage, and report
export.

## Setup

```
npm install
cp .env .env.local   # optional — edit VITE_API_URL if your backend isn't on localhost:5000
npm run dev
```

Make sure the backend is running first (see its own README) — this app has
no functionality of its own without it.

## Pages

- `/login` — log in or create an account (Field Inspector / Compliance Officer)
- `/scan` — upload a label photo; backend runs OCR + the 10-category rule engine
- `/dashboard` — KPIs + verdict distribution + recent scans
- `/repository` — searchable table of every scanned product
- `/reports/:id` — full report for one scan, with PDF and CSV export

## Notes

- Auth token is stored in `localStorage` and attached to every API call.
- Uploaded label images are served by the backend at `/uploads/...` and
  referenced directly by URL — no image data duplicated on the frontend.
- Styling is plain CSS (`src/index.css`) — no framework — kept deliberately
  simple to match the "clean, light, beautiful" brief.
