import publicController from '../controllers/publicController.js';
import empresaController from '../controllers/empresaController.js';

export default (app) => {
  app.post('/public/register', publicController.publicRegister);
  app.post('/public/inscricao', publicController.publicRegister);
  app.post('/public/nao-residente', empresaController.registerNonResident);
};
