import { init as initApm } from '@elastic/apm-rum';

export const apm = initApm({
  serviceName: 'quantm-fe',
  serverUrl: 'http://217.217.255.210:8200',
  serviceVersion: '1.0.0',
  environment: 'production',
  distributedTracingOrigins: [
    'http://localhost:8080', // Spring Boot Primary (can keep for local dev)
    'http://localhost:8081', // Spring Boot Secondary
    'http://localhost:8000', // Python AI Service
    'https://quantm-bank.com', // Production domain
  ],
});
