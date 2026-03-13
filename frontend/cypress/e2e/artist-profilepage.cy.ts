describe('Artist profil', () => {
  beforeEach(() => {
    cy.visit('/login')
    cy.get('input[type="email"]').type('alice@example.com');
    cy.get('input[type="password"]').type('demo123');
    cy.get('.btn-primary').contains(/Log in/i).click();

    cy.contains(/Manage band/i).should('exist');
    cy.get('.navbar-links > [href="/artists"]').click()
    cy.get('[href="/artist/29"]').click();
  });

  it('TC-FE-024 – Artist adatlap megjelenítése', () => {
    cy.get('.artist-card').within(() => {
      cy.get('img').should('exist');
      cy.contains(/Instrument/i).should('exist');
      cy.contains(/City/i).should('exist');
    });
  });

  it('TC-FE-025 – Hosszú leírás megjelenítése', () => {
    cy.contains(/Description/i).scrollIntoView();
    cy.get('.artist-description').should('be.visible');
  });

  it('TC-FE-026 – Send a message CTA', () => {
    cy.contains(/Send a message/i).click();
    cy.url().should('include', '/message/');
  });

  it('TC-FE-027 – Referral linkek megjelenése', () => {
    cy.contains(/Referral links/i).scrollIntoView();
    cy.get('.social-icons').should('have.length.at.least', 1);
  });
});
