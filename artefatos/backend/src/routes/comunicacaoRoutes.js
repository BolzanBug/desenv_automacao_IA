import { Router } from 'express';
import { sendEmail, getHistory } from '../controllers/comunicacaoController.js';

const router = Router();

router.post('/email', sendEmail);
router.get('/history', getHistory);

export default router;
