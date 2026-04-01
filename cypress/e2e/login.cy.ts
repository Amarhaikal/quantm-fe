describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/auth/login');
  });

  it('should display the login page and try to login', () => {
    cy.get('#username').should('be.visible').clear().type('haikal.dev');
    cy.get('#password').should('be.visible').clear().type('Superman123!');

    cy.get('button[type="submit"]').should('be.visible').click();

    cy.url().should('include', '/');
    cy.get('h2').should('contain', 'Dashboard');
  });

  it('should display error message when login fails', () => {
    cy.get('#username').should('be.visible').clear().type('haikal.dev');
    cy.get('#password').should('be.visible').clear().type('wrongpassword');

    cy.get('button[type="submit"]').should('be.visible').click();

    cy.url().should('include', '/auth/login');

    cy.get('.pi-exclamation-circle').should('be.visible');
    cy.contains('Invalid credentials').should('exist');
  });
});
