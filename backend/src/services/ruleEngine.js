/**
 * Field extraction + the 10-category Legal Metrology rule engine.
 * This is a direct port of the logic validated in the browser prototype —
 * same regex patterns, same heuristics — now running server-side.
 */

const FIELD_PATTERNS = [
  { label: 'MRP', re: /(?:MRP|M\.?R\.?P\.?)[^\d₹]{0,15}(?:Rs\.?|₹|INR)?\s*[\d][\d,]*\.?\d*/i },
  { label: 'Net quantity', re: /\b\d+(?:\.\d+)?\s?(?:g|gm|gms|kg|ml|l|litre|liters?)\b/i },
  { label: 'Mfg / exp date', re: /\b(?:\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s?\d{2,4})\b/i },
  { label: 'Consumer care', re: /\b(?:\+?\d[\d\s\-]{7,13}\d|[\w.+-]+@[\w-]+\.[a-z]{2,})\b/i },
  { label: 'Manufacturer', re: /(?:Mfd\.?\s?by|Manufactured\s?by|Marketed\s?by|Packed\s?by)[:\s]*([A-Za-z0-9 .,&'-]{4,60})/i }
];

export function computeFields(text) {
  return FIELD_PATTERNS.map((p) => {
    const m = text.match(p.re);
    return { label: p.label, value: m ? (m[1] ? m[1].trim() : m[0].trim()) : null };
  });
}

/**
 * @param {string} text - full OCR text
 * @param {Array} words - [{ text, confidence, bbox:{x0,y0,x1,y1} }]
 * @param {number} imgHeight - height of the source image in pixels
 */
export function computeRules(text, words, imgHeight) {
  const h = imgHeight || 1;

  const mrpFound = /(?:MRP|M\.?R\.?P\.?)[^\d₹]{0,15}(?:Rs\.?|₹|INR)?\s*[\d][\d,]*\.?\d*/i.test(text);
  const qtyFound = /\b\d+(?:\.\d+)?\s?(?:g|gm|gms|kg|ml|l|litre|liters?)\b/i.test(text);
  const dateFound = /\b(?:\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s?\d{2,4})\b/i.test(text);
  const careFound = /\b(?:\+?\d[\d\s\-]{7,13}\d|[\w.+-]+@[\w-]+\.[a-z]{2,})\b/i.test(text);
  const mfrMatch = text.match(/(?:Mfd\.?\s?by|Manufactured\s?by|Marketed\s?by|Packed\s?by)[:\s]*([A-Za-z0-9 .,&'-]{4,60})/i);
  const mfrFound = !!mfrMatch;
  const unitPriceFound =
    /(?:rs\.?|₹)\s?[\d.]+\s?\/\s?(?:100\s?g|kg|100\s?ml|l\b|litre)/i.test(text) ||
    /per\s?(?:100\s?g|kg|100\s?ml|litre)/i.test(text);

  const topWords = words.filter(
    (w) => w.bbox.y1 < h * 0.35 && /^[A-Za-z][A-Za-z\s]{2,}$/.test(w.text) && w.confidence > 50
  );
  const identityFound = topWords.length > 0;
  const productGuess = topWords.length ? topWords.slice(0, 3).map((w) => w.text).join(' ') : null;

  const heights = words.map((w) => w.bbox.y1 - w.bbox.y0).sort((a, b) => a - b);
  const medianH = heights.length ? heights[Math.floor(heights.length / 2)] : 0;
  const fontOk = h ? medianH / h >= 0.012 : false;

  const coreDeclarations = [mfrFound, qtyFound, mrpFound, dateFound, careFound];
  const foundCount = coreDeclarations.filter(Boolean).length;

  const rules = [
    {
      label: 'Applicability / exemptions',
      status: 'info',
      note: "Category-dependent — needs a product classification input this prototype doesn't collect yet."
    },
    {
      label: 'Mandatory declarations',
      status: foundCount === 5 ? 'pass' : foundCount >= 3 ? 'review' : 'fail',
      note: `${foundCount} of 5 core declarations detected in the OCR text.`
    },
    {
      label: 'Manufacturer / packer / importer',
      status: mfrFound ? 'pass' : 'fail',
      note: mfrFound ? `Detected: "${mfrMatch[1].trim()}"` : 'No "Mfd by / Marketed by / Packed by" line found.'
    },
    {
      label: 'Product identity',
      status: identityFound ? 'pass' : 'review',
      note: identityFound
        ? 'Prominent text block detected near the top of the label.'
        : 'No clear product-name text block detected near the top.'
    },
    {
      label: 'Net quantity',
      status: qtyFound ? 'pass' : 'fail',
      note: qtyFound ? 'Weight/volume declaration found.' : 'No g / kg / ml / l quantity pattern found.'
    },
    {
      label: 'MRP / retail sale price',
      status: mrpFound ? 'pass' : 'fail',
      note: mrpFound ? 'MRP value detected.' : 'No MRP figure found near ₹ or Rs.'
    },
    {
      label: 'Unit sale price',
      status: unitPriceFound ? 'pass' : 'info',
      note: unitPriceFound
        ? 'Per-unit price declaration found.'
        : 'Not detected — only mandatory for select loose/multi-piece packages.'
    },
    {
      label: 'Date / shelf-life declaration',
      status: dateFound ? 'pass' : 'fail',
      note: dateFound ? 'Mfg / exp / best-before date pattern found.' : 'No date pattern detected on the label.'
    },
    {
      label: 'Display / font / placement',
      status: fontOk ? 'pass' : 'review',
      note: fontOk
        ? 'Detected text height is consistent with adequate font size.'
        : 'Median detected text height is small relative to the image — verify font size in person.'
    },
    {
      label: 'Special package / e-commerce / wholesale',
      status: 'info',
      note: 'Applies only to specific package types — needs manual classification.'
    }
  ];

  const failCount = rules.filter((r) => r.status === 'fail').length;
  const reviewCount = rules.filter((r) => r.status === 'review').length;

  let verdict, verdictTitle, verdictSub;
  if (failCount > 0) {
    verdict = 'fail';
    verdictTitle = 'Non-compliant';
    verdictSub = `${failCount} declaration${failCount > 1 ? 's' : ''} missing · ${reviewCount} flagged for review`;
  } else if (reviewCount > 0) {
    verdict = 'warn';
    verdictTitle = 'Review required';
    verdictSub = `${reviewCount} categor${reviewCount > 1 ? 'ies' : 'y'} need manual confirmation`;
  } else {
    verdict = 'pass';
    verdictTitle = 'Compliant';
    verdictSub = 'All auto-checkable declarations detected';
  }

  return {
    rules,
    verdict,
    verdictTitle,
    verdictSub,
    productGuess,
    manufacturer: mfrFound ? mfrMatch[1].trim() : null
  };
}
