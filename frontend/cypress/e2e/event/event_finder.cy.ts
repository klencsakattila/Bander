describe('Esemény kereső', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('alice@example.com');
    cy.get('input[name="password"]').type('demo123');
    cy.get('.btn-primary').contains(/Log in/i).click();

    cy.contains(/Manage band|Create band/i).should('exist');
    cy.get('.navbar-links > [href="/events"]').click();
  });

  it('TC-FE-061 – Események lista betöltése', () => {
    cy.get('.event-finder-page').should('exist');
    cy.get('.event-grid .event-card').should('have.length.at.least', 1);
    // Each event card should show band name, type pill, date, and message
    cy.get('.event-grid .event-card').first().within(() => {
      cy.get('.event-title').should('exist');
      cy.get('.event-pill').should('exist');
      cy.get('.event-date').should('exist');
      cy.get('.event-message').should('exist');
    });
  });

  it('TC-FE-062 – Szűrés band alapján', () => {
    cy.get('.event-filters select').eq(0).should('be.visible').then($sel => {
      cy.wrap($sel).find('option').then($opts => {
        const vals = [...$opts].map(o => o.value).filter(v => v !== '');
        if (vals.length > 0) {
          cy.wrap($sel).select(vals[0]);
          // After selection the grid should still exist (filtered)
          cy.get('.event-grid').should('exist');
        }
      });
    });
  });

  it('TC-FE-063 – Szűrés poszt típus alapján', () => {
    cy.get('.event-filters select').eq(1).should('be.visible').then($sel => {
      cy.wrap($sel).find('option').then($opts => {
        const vals = [...$opts].map(o => o.value).filter(v => v !== '');
        if (vals.length > 0) {
          cy.wrap($sel).select(vals[0]);
          cy.get('.event-grid').should('exist');
        }
      });
    });
  });

  it('TC-FE-064 – Szöveges kereső működése', () => {
    cy.get('.event-search input').type('announcement');
    cy.get('.event-grid').should('exist');
  });
});
