describe('Globális navigáció – extra tesztek', () => {
  it('TC-FE-075 – Kijelentkezés', () => {
    // Log in first
    cy.visit('/login');
    cy.get('input[name="email"]').type('alice@example.com');
    cy.get('input[name="password"]').type('demo123');
    cy.get('.btn-primary').contains(/Log in/i).click();

    // Verify logged-in state
    cy.get('.navbar-actions').contains(/Sign out/i).should('exist');

    // Click Sign out
    cy.get('.navbar-actions button').contains(/Sign out/i).click();

    // After logout, the navbar should show Log in and Sign up
    cy.get('.navbar-actions').within(() => {
      cy.contains(/Log in/i).should('exist');
      cy.contains(/Sign up/i).should('exist');
    });
  });

  it('TC-FE-080 – Toast visszajelzés megjelenése (band mentésnél)', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('alice@example.com');
    cy.get('input[name="password"]').type('demo123');
    cy.get('.btn-primary').contains(/Log in/i).click();

    // Navigate to band management
    cy.contains(/Manage band/i, { timeout: 10000 }).should('exist');
    cy.get('.navbar-links a').contains(/Manage band/i).click();
    cy.url().should('include', '/bands/manage/');

    // Save changes to trigger toast
    cy.get('.band-forms .form-col').first().within(() => {
      cy.contains('button', /Save changes/i).click();
    });

    // Toast should appear
    cy.get('.toast', { timeout: 5000 }).should('exist');
  });

  it('TC-FE-090 – Hero szekció CTA (Artist Finder)', () => {
    cy.visit('/');
    // The homepage should have a hero button
    cy.get('body').then($body => {
      if ($body.find('.hero-btn').length > 0) {
        cy.get('.hero-btn').first().click();
        // Should redirect to /login (not logged in) or /artists
        cy.url().should('match', /\/(login|artists)/);
      } else {
        // If no hero-btn exists, check that the CTA section has links
        cy.get('.homepage-cta').should('exist');
      }
    });
  });
});
