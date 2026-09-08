# MetroCheck backend — Step 1: server + DB scaffold

Express + MongoDB (Mongoose) API for the Legal Metrology compliance checker.
This step wires up the server, the database connection, and the data models —
no OCR or rule engine logic yet, that's the next step.

## Setup

1. Install dependencies (already done if you got this as-is, otherwise):
   ```
   npm install
   ```

2. Copy the env template and fill in your MongoDB URI:
   ```
   cp .env.example .env
   ```
   - Easiest option: create a free cluster at mongodb.com/cloud/atlas, grab the
     connection string, and paste it into `MONGO_URI` in `.env`.
   - Or run Mongo locally and use `mongodb://127.0.0.1:27017/metrocheck`.

3. Run it:
   ```
   npm run dev
   ```
   You should see:
   ```
   [db] connected -> metrocheck
   [server] MetroCheck API running on port 5000
   ```

## What's here

```
server.js                    entrypoint: express app, middleware, startup
src/config/db.js             mongoose connection
src/models/Scan.js           the core compliance-scan document
src/models/User.js           inspector/officer accounts (auth logic comes later)
src/controllers/scanController.js   route handlers
src/routes/scanRoutes.js     /api/scans routes
src/middleware/errorHandler.js      404 + centralized error handling
```

## Try it

Once running, with Mongo connected:

- `GET  /api/health` → `{ status: "ok", ... }`
- `GET  /api/scans` → `[]` (empty until scans exist)
- `GET  /api/scans/stats/summary` → `{ total: 0, pass: 0, warn: 0, fail: 0 }`
- `POST /api/scans` → `501 Not implemented yet` (on purpose — next step wires this up)

## Scan document shape

```json
{
  "imageUrl": "string",
  "rawText": "string",
  "productGuess": "string | null",
  "manufacturer": "string | null",
  "mrp": "string | null",
  "fields": [{ "label": "MRP", "value": "₹199" }],
  "rules": [{ "label": "Net quantity", "status": "pass", "note": "..." }],
  "verdict": "pass | warn | fail",
  "verdictTitle": "Compliant | Review required | Non-compliant",
  "verdictSub": "string",
  "scannedBy": "ObjectId | null",
  "createdAt": "date",
  "updatedAt": "date"
}
```

This mirrors exactly what the browser prototype was computing client-side —
next step ports that OCR + rule-engine logic into `POST /api/scans` so it runs
server-side instead.

## Next step

Wire up image upload (Multer) + server-side OCR (Tesseract.js) + the rule
engine, so `POST /api/scans` actually does the work instead of returning 501.
