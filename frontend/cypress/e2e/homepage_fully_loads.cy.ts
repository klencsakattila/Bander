describe('Bander – nyitóoldal', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('TC-FE-001 – Nyitóoldal betöltése', () => {
    cy.contains(/Bander/i).should('be.visible');
  });

  it('TC-FE-002 – Felső navigáció', () => {
    cy.contains(/Bands/i).should('be.visible').and('have.attr', 'href');
    cy.contains(/Artists/i).should('be.visible').and('have.attr', 'href');
    cy.contains(/Log in/i).should('be.visible').and('have.attr', 'href');
  });

  it('TC-FE-003 – New Artists blokk', () => {
    cy.contains(/New Artists/i).scrollIntoView();
    cy.get('[href="/artist/1"] > .artist-card');
  });

  it('TC-FE-004 – Bands előnézet', () => {
    cy.contains(/Bands/i).scrollIntoView();
    cy.get('[href="/band/19"] > .band-item > h4');
  });

  it('TC-FE-005 – Upcoming events blokk', () => {
    cy.contains(/Upcoming events/i).scrollIntoView();
    cy.get('.events-grid > :nth-child(1)');
  });

  it('TC-FE-006 – CTA a teljes funkciókhoz', () => {
    cy.contains(/For all features/i).scrollIntoView();
    cy.contains(/Log in/i).should('be.visible');
    cy.contains(/Sign up/i).should('be.visible');
  });
});
