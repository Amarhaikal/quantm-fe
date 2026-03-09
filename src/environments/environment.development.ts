export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  // apiUrl: 'https://api.quantm-bank.com',
  azureAd: {
    clientId: 'a1b425c3-6265-4580-a417-0b8c74f77e8e',
    authority: 'https://login.microsoftonline.com/6bfecc36-0624-428f-b3bf-84cc04589b28',
    redirectUri: 'http://localhost:3000/auth/login',
  },
  apm: {
    serverUrl: 'http://localhost:8200',
    environment: 'development',
  },
};
