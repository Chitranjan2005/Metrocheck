import Tesseract from 'tesseract.js';

/**
 * Runs OCR on an image file and returns the recognized text plus per-word
 * bounding boxes / confidence, same shape the original browser prototype used.
 */
export async function runOcr(imagePath) {
  const { data } = await Tesseract.recognize(imagePath, 'eng');
  const words = (data.words || [])
    .filter((w) => w.text && w.text.trim())
    .map((w) => ({
      text: w.text,
      confidence: w.confidence,
      bbox: w.bbox
    }));
  return { text: data.text || '', words };
}
