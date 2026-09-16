import publicController from '../controllers/publicController.js';

export default (router) => {
  router.post('/public/register', publicController.publicRegister);
};

