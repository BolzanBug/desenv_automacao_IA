import espacoController from '../controllers/espacoController.js';

export default (router) => {
  router.get('/spaces', espacoController.getSpaces);
  router.post('/spaces', espacoController.persistSpace);
  router.put('/spaces/:id', espacoController.updateSpace);
  router.delete('/spaces/:id', espacoController.deleteSpace);
};

