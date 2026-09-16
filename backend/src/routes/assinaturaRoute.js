import assinaturaController from '../controllers/assinaturaController.js';

export default (router) => {
  router.get('/companies/:id/signatures', assinaturaController.getByEmpresa);
  router.put('/companies/:id/signatures/:tipo', assinaturaController.updateSignatario);
};

