import fs from 'fs';
import { imageSize } from 'image-size';
import Scan from '../models/Scan.js';
import { runOcr } from '../services/ocrService.js';
import { computeFields, computeRules } from '../services/ruleEngine.js';
import { streamScanPdf, scanToCsv } from '../services/reportService.js';

// GET /api/scans
export async function listScans(req, res, next) {
  try {
    const scans = await Scan.find().sort({ createdAt: -1 }).limit(200);
    res.json(scans);
  } catch (err) {
    next(err);
  }
}

// GET /api/scans/:id
export async function getScan(req, res, next) {
  try {
    const scan = await Scan.findById(req.params.id);
    if (!scan) return res.status(404).json({ error: 'Scan not found' });
    res.json(scan);
  } catch (err) {
    next(err);
  }
}

// GET /api/scans/stats/summary
export async function getStats(req, res, next) {
  try {
    const [total, pass, warn, fail] = await Promise.all([
      Scan.countDocuments(),
      Scan.countDocuments({ verdict: 'pass' }),
      Scan.countDocuments({ verdict: 'warn' }),
      Scan.countDocuments({ verdict: 'fail' })
    ]);
    res.json({ total, pass, warn, fail });
  } catch (err) {
    next(err);
  }
}

// POST /api/scans  (multipart/form-data, field name "image")
export async function createScan(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded (field name should be "image")' });

    const imagePath = req.file.path;
    const dims = imageSize(fs.readFileSync(imagePath));

    const { text, words } = await runOcr(imagePath);
    const fields = computeFields(text);
    const ruleResult = computeRules(text, words, dims.height);

    const scan = await Scan.create({
      imageUrl: `/uploads/${req.file.filename}`,
      rawText: text,
      productGuess: ruleResult.productGuess,
      manufacturer: ruleResult.manufacturer,
      mrp: fields.find((f) => f.label === 'MRP')?.value || null,
      fields,
      rules: ruleResult.rules,
      verdict: ruleResult.verdict,
      verdictTitle: ruleResult.verdictTitle,
      verdictSub: ruleResult.verdictSub,
      scannedBy: req.user ? req.user.id : null
    });

    res.status(201).json(scan);
  } catch (err) {
    next(err);
  }
}

// GET /api/scans/:id/report.pdf
export async function downloadPdf(req, res, next) {
  try {
    const scan = await Scan.findById(req.params.id);
    if (!scan) return res.status(404).json({ error: 'Scan not found' });
    streamScanPdf(scan, res);
  } catch (err) {
    next(err);
  }
}

// GET /api/scans/:id/report.csv
export async function downloadCsv(req, res, next) {
  try {
    const scan = await Scan.findById(req.params.id);
    if (!scan) return res.status(404).json({ error: 'Scan not found' });
    const csv = scanToCsv(scan);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="scan-${scan._id}.csv"`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
}
