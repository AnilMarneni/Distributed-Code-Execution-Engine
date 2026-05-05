import client from 'prom-client';
import express from 'express';

const register = new client.Registry();
register.setDefaultLabels({ app: 'scheduler-service' });
client.collectDefaultMetrics({ register });

// Scheduler specific metrics
export const jobsDispatchedCounter = new client.Counter({
  name: 'jobs_dispatched_total',
  help: 'Total number of jobs dispatched to workers',
  labelNames: ['worker_id']
});

export const workerHealthGauge = new client.Gauge({
  name: 'worker_health_status',
  help: 'Health status of workers (1 for UP, 0 for DOWN)',
  labelNames: ['worker_id']
});

register.registerMetric(jobsDispatchedCounter);
register.registerMetric(workerHealthGauge);

export const startMetricsServer = (port: number) => {
  const app = express();
  
  app.get('/metrics', async (req, res) => {
    res.setHeader('Content-Type', register.contentType);
    res.send(await register.metrics());
  });

  app.listen(port, () => {
    console.log(`Scheduler Metrics server listening on port ${port}`);
  });
};
