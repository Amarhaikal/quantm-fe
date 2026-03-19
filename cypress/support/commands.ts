/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      login(username?: string, password?: string): Chainable<void>;
    }
  }
}

export {};

Cypress.Commands.add('login', (username, password) => {
  cy.session([username, password], () => {
    // 1. Make a direct HTTP request to your backend login API route
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/api/auth/login', // Replace with your actual API URL!
      body: { username, password },
    }).then((response) => {});
  });
});
