describe('Bander – nyitóoldal', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('TC-FE-001 – Nyitóoldal betöltése', () => {
    cy.contains(/Bander/i).should('be.visible');
  });

  it('TC-FE-002 – Felső navigáció', () => {
    cy.get('.navbar-links').within(() => {
      cy.contains(/Bands/i).should('be.visible');
      cy.contains(/Artists/i).should('be.visible');
      cy.contains(/Events/i).should('be.visible');
    });
    cy.get('.navbar-actions').contains(/Log in/i).should('be.visible');
  });

  it('TC-FE-003 – New Artists blokk', () => {
    cy.contains(/New Artists/i).scrollIntoView();
    cy.get('.artists-grid').should('exist');
    cy.get('.artists-grid .artist-card').should('have.length.at.least', 1);
  });

  it('TC-FE-004 – Bands előnézet', () => {
    cy.contains('h2', /Bands/i).scrollIntoView();
    cy.get('.bands-list .band-item').should('have.length.at.least', 1);
  });

  it('TC-FE-005 – Upcoming events blokk', () => {
    cy.contains(/Upcoming events/i).scrollIntoView();
    cy.get('.events-grid').should('exist');
    cy.get('.events-grid .event-card').should('have.length.at.least', 1);
  });

  it('TC-FE-006 – CTA a teljes funkciókhoz', () => {
    cy.contains(/For all features/i).scrollIntoView();
    cy.get('.homepage-cta').within(() => {
      cy.contains(/Log in/i).should('be.visible');
      cy.contains(/Sign up/i).should('be.visible');
    });
  });
});
