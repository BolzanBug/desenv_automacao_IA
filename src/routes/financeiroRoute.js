import financeiroController from '../controllers/financeiroController.js';

export default (router) => {
  router.get('/financial/invoices', financeiroController.getInvoices);
  router.post('/financial/invoices', financeiroController.persistInvoice);
  router.get('/financial/companies/:id', financeiroController.getByEmpresa);
  router.patch('/financial/invoices/:id/payment', financeiroController.registerPayment);
};

