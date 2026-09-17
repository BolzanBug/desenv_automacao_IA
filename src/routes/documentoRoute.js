import multer from 'multer';
import path from 'path';
import fs from 'fs';
import documentoController from '../controllers/documentoController.js';

const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage });

export default (app) => {
  app.get('/companies/:id/documents', documentoController.getByEmpresa);
  app.post('/companies/:id/documents', upload.single('file'), documentoController.uploadDocument);
  app.patch('/documents/:docId/status', documentoController.updateStatus);
  app.delete('/documents/:docId', documentoController.removeDocument);

  // Aliases em português
  app.get('/empresas/:id/documentos', documentoController.getByEmpresa);
  app.post('/empresas/:id/documentos', upload.single('file'), documentoController.uploadDocument);
};
