describe('Band kereső', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('alice@example.com');
    cy.get('input[name="password"]').type('demo123');
    cy.get('.btn-primary').contains(/Log in/i).click();

    cy.contains(/Manage band|Create band/i).should('exist');
    cy.get('.navbar-links > [href="/bands"]').click();
  });

  it('TC-FE-034 – Bands lista betöltése', () => {
    cy.get('.band-grid').should('exist');
    cy.get('.band-grid .band-card').should('have.length.at.least', 1);
  });

  it('TC-FE-035 – Szűrés város alapján', () => {
    cy.get('.band-filters select').then($sel => {
      cy.wrap($sel).find('option').then($opts => {
        const vals = [...$opts].map(o => o.value).filter(v => v !== '');
        if (vals.length > 0) {
          cy.wrap($sel).select(vals[0]);
        }
      });
    });
  });

  it('TC-FE-036 – Szöveges kereső működése', () => {
    cy.get('.band-search input').type('Deep');
    cy.get('.band-grid').should('exist');
  });

  it('TC-FE-038 – Üres találati állapot', () => {
    cy.get('.band-search input').type('xyznonexistent12345');
    // When no bands match the search, the grid should be empty
    cy.get('.band-grid .band-card').should('have.length', 0);
  });
});
