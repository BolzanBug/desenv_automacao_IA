import { Router } from 'express';
import { launch, getAll, pay } from '../controllers/cobrancaController.js';

const router = Router();

router.post('/invoices', launch);
router.get('/invoices', getAll);
router.put('/invoices/:id/pay', pay);

export default router;
