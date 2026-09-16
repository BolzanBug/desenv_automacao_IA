import empresaController from '../controllers/empresaController.js';

export default (router) => {
  router.get('/companies', empresaController.get);
  router.post('/companies', empresaController.persist);
  router.get('/companies/:id', empresaController.getById);
  router.put('/companies/:id', empresaController.update);
  router.delete('/companies/:id', empresaController.remove);
  router.patch('/companies/:id/status', empresaController.updateStatus);
  router.post('/companies/:id/contract/generate', empresaController.generateContract);
};

