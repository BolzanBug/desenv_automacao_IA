import publicController from '../controllers/publicController.js';

export default (app) => {
  app.post('/public/register', publicController.publicRegister);
  app.post('/public/inscricao', publicController.publicRegister);
};
