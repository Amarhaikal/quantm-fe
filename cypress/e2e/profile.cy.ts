describe('Profile Settings', () => {
  beforeEach(() => {
    // 1. Set the viewport to a standard 1080p desktop size so the sidebar
    // doesn't awkwardly collapse or overlay the content like it does on mobile/tablets!
    cy.viewport(1280, 720);

    // cy.login('haikal.dev', 'Superman123!');
    cy.visit('http://localhost:3000/auth/login');
  });

  it('should display the login page and try to login', () => {
    cy.get('#username').should('be.visible').clear().type('haikal.dev');
    cy.get('#password').should('be.visible').clear().type('Superman123!');

    cy.get('button[type="submit"]').should('be.visible').click();

    cy.url().should('include', '/');
    cy.get('h2').should('contain', 'Dashboard');

    // Click button hamburger to open sidebar using its exact aria-label for reliability!
    cy.get('[aria-label="Toggle Sidebar"]').should('be.visible').click();

    // The profile button is an <a> tag pointing to /settings/profile.
    // The most robust way to find it is by checking its 'href' or using cy.contains()!
    cy.get('a[href="/settings/profile"]').should('be.visible').click();

    cy.url().should('include', '/settings/profile');

    // ── Click the grey overlay mask to close the sidebar ──
    cy.get('.p-drawer-mask').should('be.visible').click();

    cy.get('h1').should('contain', 'My Profile');

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randomLetter = alphabet[Cypress._.random(0, 25)];
    const randomName = `Haikal ${randomLetter}`;
    cy.get('input[placeholder="Enter Short Name"]').should('be.visible').clear().type(randomName);
    cy.get('input[placeholder="Enter Short Name"]').should('have.value', randomName);

    // click button save
    cy.contains('button', 'Save').should('be.visible').click();

    // click button confirm
    cy.contains('button', 'Confirm').should('be.visible').click();

    // show toast message
    cy.get('.p-toast-message-success').should('be.visible');
    cy.contains('Record updated successfully').should('be.visible');
  });

  it('should show error toast when entering an invalid short name (symbols/numbers)', () => {
    // 1. Login and Navigate to Profile
    cy.get('#username').should('be.visible').clear().type('haikal.dev');
    cy.get('#password').should('be.visible').clear().type('Superman123!');
    cy.get('button[type="submit"]').should('be.visible').click();

    cy.get('[aria-label="Toggle Sidebar"]').should('be.visible').click();
    cy.get('a[href="/settings/profile"]').should('be.visible').click();
    cy.get('.p-drawer-mask').should('be.visible').click();

    // 2. Type invalid name (symbols and numbers)
    // Your regex: /^[a-zA-Z\s'. -]+$/ (Does not allow numbers or @)
    cy.get('input[placeholder="Enter Short Name"]')
      .should('be.visible')
      .clear()
      .type('Invalid@123');

    // 3. Click save
    cy.contains('button', 'Save').should('be.visible').click();

    // 4. Verify the error toast message
    cy.get('.p-toast-message-error').should('be.visible');
    cy.contains('Please fill in all required fields correctly').should('be.visible');

    // 5. Verify the inline regex error message also appears
    cy.contains('Name can only contain letters, spaces, dots, hyphens, and single quotes').should(
      'be.visible',
    );
  });
});
