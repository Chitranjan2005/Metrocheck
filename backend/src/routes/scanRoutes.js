import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import { requireAuth } from '../middleware/auth.js';
import {
  listScans,
  getScan,
  getStats,
  createScan,
  downloadPdf,
  downloadCsv
} from '../controllers/scanController.js';

const router = Router();

router.get('/stats/summary', requireAuth, getStats); // before /:id so "stats" isn't parsed as an id
router.get('/', requireAuth, listScans);
router.get('/:id', requireAuth, getScan);
router.post('/', requireAuth, upload.single('image'), createScan);
router.get('/:id/report.pdf', requireAuth, downloadPdf);
router.get('/:id/report.csv', requireAuth, downloadCsv);

export default router;
