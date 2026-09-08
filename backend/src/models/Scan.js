import mongoose from 'mongoose';

const fieldSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },   // e.g. "MRP", "Net quantity"
    value: { type: String, default: null }      // extracted value, null if not found
  },
  { _id: false }
);

const ruleResultSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },    // e.g. "Manufacturer / packer / importer"
    status: {
      type: String,
      enum: ['pass', 'fail', 'review', 'info'],
      required: true
    },
    note: { type: String, default: '' }
  },
  { _id: false }
);

const scanSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },       // where the uploaded/processed image lives
    rawText: { type: String, default: '' },            // full OCR text, kept for debugging/audits

    productGuess: { type: String, default: null },
    manufacturer: { type: String, default: null },
    mrp: { type: String, default: null },

    fields: [fieldSchema],
    rules: [ruleResultSchema],

    verdict: {
      type: String,
      enum: ['pass', 'warn', 'fail'],
      required: true
    },
    verdictTitle: { type: String, required: true },    // "Compliant" / "Review required" / "Non-compliant"
    verdictSub: { type: String, default: '' },

    scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
  },
  { timestamps: true }
);

scanSchema.index({ verdict: 1, createdAt: -1 });

export default mongoose.model('Scan', scanSchema);
