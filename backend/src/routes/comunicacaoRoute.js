import comunicacaoController from '../controllers/comunicacaoController.js';

export default (router) => {
  router.get('/communications/emails', comunicacaoController.getHistory);
  router.post('/communications/emails', comunicacaoController.sendEmail);
};

