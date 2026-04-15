describe('Artist profil', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('alice@example.com');
    cy.get('input[name="password"]').type('demo123');
    cy.get('.btn-primary').contains(/Log in/i).click();

    cy.contains(/Manage band|Create band/i).should('exist');
    cy.get('.navbar-links > [href="/artists"]').click();
    // Click first artist card to navigate to their profile
    cy.get('.artist-grid a.artist-card').first().click();
    cy.url().should('include', '/artist/');
  });

  it('TC-FE-024 – Artist adatlap megjelenítése', () => {
    cy.get('.artist-profile-left .artist-card').within(() => {
      cy.get('img.artist-avatar').should('exist');
      cy.contains(/Instrument/i).should('exist');
      cy.contains(/City/i).should('exist');
    });
  });

  it('TC-FE-025 – Hosszú leírás megjelenítése', () => {
    cy.contains(/Description/i).scrollIntoView();
    cy.get('.artist-description').should('be.visible');
  });

  it('TC-FE-026 – Send a message CTA', () => {
    cy.contains('button', /Send a message/i).click();
    cy.url().should('include', '/message/');
  });

  it('TC-FE-027 – Referral linkek megjelenése', () => {
    cy.contains(/Referral links/i).scrollIntoView();
    cy.get('.social-icons').should('exist');
    cy.get('.social-icons svg').should('have.length.at.least', 1);
  });
});
