import assinaturaController from '../controllers/assinaturaController.js';

export default (app) => {
  app.get('/companies/:id/signatures', assinaturaController.getByEmpresa);
  app.put('/companies/:id/signatures/:tipo', assinaturaController.updateSignatario);

  // Aliases em português
  app.get('/empresas/:id/assinaturas', assinaturaController.getByEmpresa);
  app.put('/empresas/:id/assinaturas/:tipo', assinaturaController.updateSignatario);
};
