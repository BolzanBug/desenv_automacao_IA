import financeiroController from '../controllers/financeiroController.js';

export default (app) => {
  app.get('/financial/invoices', financeiroController.getInvoices);
  app.post('/financial/invoices', financeiroController.persistInvoice);
  app.get('/financial/companies/:id', financeiroController.getByEmpresa);
  app.patch('/financial/invoices/:id/payment', financeiroController.registerPayment);

  // Aliases em português
  app.get('/faturas', financeiroController.getInvoices);
  app.post('/faturas', financeiroController.persistInvoice);
  app.get('/empresas/:id/faturas', financeiroController.getByEmpresa);
  app.patch('/faturas/:id/pagamento', financeiroController.registerPayment);
};
