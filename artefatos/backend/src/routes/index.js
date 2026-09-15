import { Router } from 'express';
import empresaRoutes from './empresaRoutes.js';
import documentoRoutes from './documentoRoutes.js';
import cobrancaRoutes from './cobrancaRoutes.js';
import comunicacaoRoutes from './comunicacaoRoutes.js';
import espacoRoutes from './espacoRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';

const router = Router();

// Agrupamento centralizado de todas as rotas da API
router.use('/companies', empresaRoutes);
router.use('/companies', documentoRoutes);
router.use('/documents', documentoRoutes);
router.use('/financial', cobrancaRoutes);
router.use('/communications', comunicacaoRoutes);
router.use('/spaces', espacoRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;

