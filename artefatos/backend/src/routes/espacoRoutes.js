import { Router } from 'express';
import { getAll, allocate, create } from '../controllers/espacoController.js';

const router = Router();

router.get('/', getAll);
router.post('/', create);
router.post('/allocate', allocate);

export default router;

