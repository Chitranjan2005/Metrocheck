import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const STATUS_COLOR = { pass: '#0f9d6c', fail: '#e0435b', review: '#c8860a', info: '#6b7280' };

/**
 * Streams a compliance-report PDF for the given scan directly to `res`.
 */
export function streamScanPdf(scan, res) {
  const doc = new PDFDocument({ margin: 48, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="scan-${scan._id}.pdf"`);
  doc.pipe(res);

  doc.fontSize(18).fillColor('#111827').text('MetroCheck — Compliance Report', { align: 'left' });
  doc.moveDown(0.2);
  doc
    .fontSize(9)
    .fillColor('#6b7280')
    .text('Legal Metrology (Packaged Commodities) Rules, 2011', { align: 'left' });
  doc.moveDown(1);

  doc.fontSize(10).fillColor('#6b7280').text(`Scan ID: ${scan._id}`);
  doc.text(`Scanned: ${new Date(scan.createdAt).toLocaleString()}`);
  if (scan.productGuess) doc.text(`Product: ${scan.productGuess}`);
  if (scan.manufacturer) doc.text(`Manufacturer: ${scan.manufacturer}`);
  if (scan.mrp) doc.text(`MRP: ${scan.mrp}`);
  doc.moveDown(0.8);

  const vColor = STATUS_COLOR[scan.verdict] || '#111827';
  doc.fontSize(14).fillColor(vColor).text(`Verdict: ${scan.verdictTitle}`);
  doc.fontSize(9).fillColor('#6b7280').text(scan.verdictSub || '');
  doc.moveDown(1);

  if (scan.imageUrl) {
    const absPath = path.join(process.cwd(), scan.imageUrl);
    if (fs.existsSync(absPath)) {
      try {
        doc.image(absPath, { fit: [220, 220] });
        doc.moveDown(1);
      } catch (_) {
        /* image embedding is best-effort */
      }
    }
  }

  doc.fontSize(12).fillColor('#111827').text('Extracted declarations', { underline: true });
  doc.moveDown(0.4);
  (scan.fields || []).forEach((f) => {
    doc
      .fontSize(10)
      .fillColor('#111827')
      .text(`${f.label}:  `, { continued: true })
      .fillColor(f.value ? '#0f9d6c' : '#e0435b')
      .text(f.value || 'Not detected');
  });
  doc.moveDown(1);

  doc.fontSize(12).fillColor('#111827').text('Rule engine result', { underline: true });
  doc.moveDown(0.4);
  (scan.rules || []).forEach((r, i) => {
    doc
      .fontSize(10)
      .fillColor('#111827')
      .text(`${i + 1}. ${r.label} — `, { continued: true })
      .fillColor(STATUS_COLOR[r.status] || '#111827')
      .text(r.status.toUpperCase());
    doc.fontSize(9).fillColor('#6b7280').text(r.note || '', { indent: 14 });
    doc.moveDown(0.3);
  });

  doc.end();
}

/**
 * Returns a CSV string for the scan — the "editable format" export
 * (opens cleanly in Excel/Sheets for an inspector to annotate further).
 */
export function scanToCsv(scan) {
  const rows = [];
  rows.push(['Field', 'Value']);
  rows.push(['Scan ID', String(scan._id)]);
  rows.push(['Scanned at', new Date(scan.createdAt).toLocaleString()]);
  rows.push(['Product', scan.productGuess || '']);
  rows.push(['Manufacturer', scan.manufacturer || '']);
  rows.push(['MRP', scan.mrp || '']);
  rows.push(['Verdict', scan.verdictTitle]);
  rows.push([]);
  rows.push(['Extracted declaration', 'Value']);
  (scan.fields || []).forEach((f) => rows.push([f.label, f.value || 'Not detected']));
  rows.push([]);
  rows.push(['#', 'Rule category', 'Status', 'Note']);
  (scan.rules || []).forEach((r, i) => rows.push([i + 1, r.label, r.status.toUpperCase(), r.note || '']));

  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return rows.map((row) => row.map(escape).join(',')).join('\n');
}
