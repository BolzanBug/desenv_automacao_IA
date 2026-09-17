import dashboardController from '../controllers/dashboardController.js';

export default (app) => {
  app.get('/dashboard/metrics', dashboardController.getMetrics);
  app.get('/dashboard/metricas', dashboardController.getMetrics);
};
