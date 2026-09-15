import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { generate, upload, getByCompany, download } from '../controllers/documentoController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsPath = path.resolve(__dirname, '../../uploads');

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`);
  }
});

const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limite
});

const router = Router();

router.post('/:id/documents/generate', generate);
router.post('/:id/contract/generate', generate);
router.post('/:id/documents', uploadMiddleware.single('file'), upload);
router.get('/:id/documents', getByCompany);
router.get('/download/:id', download);

export default router;
