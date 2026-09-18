import empresaController from '../controllers/empresaController.js';

export default (app) => {
  app.get('/companies', empresaController.get);
  app.post('/companies', empresaController.persist);
  app.get('/companies/:id', empresaController.getById);
  app.put('/companies/:id', empresaController.update);
  app.delete('/companies/:id', empresaController.remove);
  app.patch('/companies/:id/status', empresaController.updateStatus);
  app.post('/companies/:id/contract/generate', empresaController.generateContract);
  app.post('/companies/nao-residente', empresaController.registerNonResident);

  // Aliases compatíveis com rotas em português
  app.get('/empresas', empresaController.get);
  app.post('/empresas', empresaController.persist);
  app.post('/empresas/nao-residente', empresaController.registerNonResident);
  app.post('/empresas/:id/contract/generate', empresaController.generateContract);
  app.get('/empresas/:id', empresaController.getById);
  app.put('/empresas/:id', empresaController.update);
  app.delete('/empresas/:id', empresaController.remove);
};

