import { init as initApm } from '@elastic/apm-rum';
import { environment } from '../../environments/environment';

export const apm = initApm({
  serviceName: 'quantm-fe',
  serverUrl: environment.apm.serverUrl,
  serviceVersion: '1.0.0',
  environment: environment.apm.environment,
  distributedTracingOrigins: [
    'http://localhost:8080', // Spring Boot Primary
    'http://localhost:8081', // Spring Boot Secondary
    'http://localhost:8000', // Python AI Service
    'https://quantm-bank.com', // Production domain
  ],
});
