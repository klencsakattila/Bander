describe('Band profil – extra tesztek', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('alice@example.com');
    cy.get('input[name="password"]').type('demo123');
    cy.get('.btn-primary').contains(/Log in/i).click();

    cy.contains(/Manage band|Create band/i).should('exist');
    cy.get('.navbar-links > [href="/bands"]').click();
    cy.get('.band-grid a.band-card').first().click();
    cy.url().should('include', '/band/');
  });

  it('TC-FE-084 – Band header megjelenítése', () => {
    cy.get('.band-header').should('exist');
    cy.get('.band-header h1').should('exist').and('not.be.empty');
  });
});
