import espacoController from '../controllers/espacoController.js';

export default (app) => {
  app.get('/spaces', espacoController.getSpaces);
  app.post('/spaces', espacoController.persistSpace);
  app.put('/spaces/:id', espacoController.updateSpace);
  app.delete('/spaces/:id', espacoController.deleteSpace);

  // Aliases em português
  app.get('/espacos', espacoController.getSpaces);
  app.post('/espacos', espacoController.persistSpace);
  app.put('/espacos/:id', espacoController.updateSpace);
  app.delete('/espacos/:id', espacoController.deleteSpace);
};
