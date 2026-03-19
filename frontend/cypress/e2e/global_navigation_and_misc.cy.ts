describe('Globális navigáció és egyéb', () => {
  it('TC-FE-057 – Publikus fejléc linkek működése', () => {
    cy.visit('/');

    // Navbar links
    cy.get('.navbar-links').contains(/Artists/i).click();
    cy.url().should('include', '/login'); // Protected route redirects to login

    cy.visit('/');
    cy.get('.navbar-links').contains(/Bands/i).click();
    cy.url().should('include', '/login'); // Protected route redirects to login

    cy.visit('/');
    cy.get('.navbar-actions').contains(/Log in/i).click();
    cy.url().should('include', '/login');
  });

  it('TC-FE-058 – Bejelentkezett állapot fejléc megjelenése', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('alice@example.com');
    cy.get('input[name="password"]').type('demo123');
    cy.get('.btn-primary').contains(/Log in/i).click();

    // After login, navbar should show "My account" and "Sign out"
    cy.get('.navbar-actions').within(() => {
      cy.contains(/My account/i).should('exist');
      cy.contains(/Sign out/i).should('exist');
    });
  });

  it('TC-FE-059 – Footer linkek megjelenése', () => {
    cy.visit('/');
    cy.get('.footer').scrollIntoView();
    cy.get('.footer').within(() => {
      cy.contains(/Artists/i).should('exist');
      cy.contains(/Bands/i).should('exist');
      cy.contains(/About Us/i).should('exist');
    });
  });

  it('TC-FE-060 – Reszponzivitás – mobil nézet', () => {
    cy.viewport('iphone-6');
    cy.visit('/');
    cy.get('.navbar').should('be.visible');
    cy.contains(/Bander/i).should('be.visible');
  });
});
