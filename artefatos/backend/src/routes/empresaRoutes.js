import { Router } from 'express';
import { create, getAll, getById, update, remove, updateLegalStatus } from '../controllers/empresaController.js';

const router = Router();

router.post('/', create);
router.get('/', getAll);
router.get('/:id', getById);
router.put('/:id', update);
router.delete('/:id', remove);
router.put('/:id/legal-status', updateLegalStatus);

export default router;
