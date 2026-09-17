import comunicacaoController from '../controllers/comunicacaoController.js';

export default (app) => {
  app.get('/communications/emails', comunicacaoController.getHistory);
  app.post('/communications/emails', comunicacaoController.sendEmail);

  // Aliases em português
  app.get('/comunicacoes/historico', comunicacaoController.getHistory);
  app.post('/comunicacoes/disparar', comunicacaoController.sendEmail);
};
