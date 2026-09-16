import dashboardController from '../controllers/dashboardController.js';

export default (router) => {
  router.get('/dashboard/metrics', dashboardController.getMetrics);
};

