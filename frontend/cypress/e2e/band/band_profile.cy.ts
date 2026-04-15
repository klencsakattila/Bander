describe('Band profil', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('alice@example.com');
    cy.get('input[name="password"]').type('demo123');
    cy.get('.btn-primary').contains(/Log in/i).click();

    cy.contains(/Manage band|Create band/i).should('exist');
    cy.get('.navbar-links > [href="/bands"]').click();
    // Click first band card
    cy.get('.band-grid a.band-card').first().click();
    cy.url().should('include', '/band/');
  });

  it('TC-FE-039 – Band adatlap megjelenítése', () => {
    cy.get('.band-profile-page').should('exist');
    cy.get('.band-info-text').within(() => {
      cy.contains(/Open spots/i).should('exist');
    });
    cy.contains(/Current members/i).should('exist');
  });

  it('TC-FE-040 – Band csatlakozási információ', () => {
    // The band profile page shows a join section with info text
    cy.get('.band-apply').should('exist');
    cy.get('.band-apply').within(() => {
      cy.contains(/Csatlakozás/i).should('exist');
    });
  });

  it('TC-FE-041 – Report band gomb', () => {
    cy.get('.band-report-btn').should('exist');
    cy.get('.band-report-btn').click();
    // Report modal should appear
    cy.get('.report-modal').should('exist');
  });

  it('TC-FE-042 – Current members blokk', () => {
    cy.contains(/Current members/i).scrollIntoView();
    cy.get('.band-members').should('exist');
  });

  it('TC-FE-043 – Events blokk', () => {
    cy.get('.band-events').should('exist');
    cy.get('.band-events .event-card').should('have.length.at.least', 1);
  });
});
