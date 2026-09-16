import express from 'express';
import empresaRoute from './empresaRoute.js';
import assinaturaRoute from './assinaturaRoute.js';
import financeiroRoute from './financeiroRoute.js';
import documentoRoute from './documentoRoute.js';
import espacoRoute from './espacoRoute.js';
import comunicacaoRoute from './comunicacaoRoute.js';
import dashboardRoute from './dashboardRoute.js';
import publicRoute from './publicRoute.js';

export default function Routes(app) {
  const router = express.Router();

  empresaRoute(router);
  assinaturaRoute(router);
  financeiroRoute(router);
  documentoRoute(router);
  espacoRoute(router);
  comunicacaoRoute(router);
  dashboardRoute(router);
  publicRoute(router);

  app.use('/api/v1', router);
  // Alias compatíveis
  app.use('/api', router);
  app.use('/', router);
}

