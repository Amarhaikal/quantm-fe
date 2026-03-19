import { init as initApm } from '@elastic/apm-rum';
import { environment } from '../../environments/environment';

// Prevent the APM package from trying to capture navigation timings in JSDOM which causes test crashes
const isTestEnv = typeof (globalThis as any).process !== 'undefined' && (globalThis as any).process.env['NODE_ENV'] === 'test' 
  || typeof navigator !== 'undefined' && navigator.userAgent.includes('jsdom') 
  || typeof (globalThis as any).__vitest_worker__ !== 'undefined';

export const apm = initApm({
  active: !isTestEnv, // <-- Safely disables APM RUM in tests
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
