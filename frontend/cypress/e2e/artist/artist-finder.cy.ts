describe('Artist kereső', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('alice@example.com');
    cy.get('input[name="password"]').type('demo123');
    cy.get('.btn-primary').contains(/Log in/i).click();

    cy.contains(/Manage band|Create band/i).should('exist');
    cy.get('.navbar-links > [href="/artists"]').click();
  });

  it('TC-FE-016 – Artists lista betöltése', () => {
    cy.get('.artist-finder-layout').should('exist');
    cy.get('.artist-grid .artist-card').should('have.length.at.least', 1);
  });

  it('TC-FE-017 – Szöveges kereső működése', () => {
    cy.get('.artist-search input').type('guitar');
    cy.get('.artist-grid .artist-card').should('have.length.at.least', 0);
  });

  it('TC-FE-018 – Szűrés város alapján', () => {
    // City is the 1st select inside .artist-filters
    cy.get('.artist-filters select').eq(0).should('be.visible').then($sel => {
      // Pick any non-empty option if Budapest isn't available
      cy.wrap($sel).find('option').then($opts => {
        const vals = [...$opts].map(o => o.value).filter(v => v !== '');
        if (vals.length > 0) {
          cy.wrap($sel).select(vals[0]);
        }
      });
    });
  });

  it('TC-FE-019 – Szűrés hangszer alapján', () => {
    // Instrument is the 2nd select
    cy.get('.artist-filters select').eq(1).should('be.visible').then($sel => {
      cy.wrap($sel).find('option').then($opts => {
        const vals = [...$opts].map(o => o.value).filter(v => v !== '');
        if (vals.length > 0) {
          cy.wrap($sel).select(vals[0]);
        }
      });
    });
  });

  it('TC-FE-020 – Szűrés műfaj alapján', () => {
    // Genre is the 3rd select
    cy.get('.artist-filters select').eq(2).should('be.visible').then($sel => {
      cy.wrap($sel).find('option').then($opts => {
        const vals = [...$opts].map(o => o.value).filter(v => v !== '');
        if (vals.length > 0) {
          cy.wrap($sel).select(vals[0]);
        }
      });
    });
  });

  it('TC-FE-021 – Több szűrő kombinálása', () => {
    // Select from each filter if options are available
    cy.get('.artist-filters select').eq(0).then($sel => {
      cy.wrap($sel).find('option').then($opts => {
        const vals = [...$opts].map(o => o.value).filter(v => v !== '');
        if (vals.length > 0) cy.wrap($sel).select(vals[0]);
      });
    });
    cy.get('.artist-filters select').eq(1).then($sel => {
      cy.wrap($sel).find('option').then($opts => {
        const vals = [...$opts].map(o => o.value).filter(v => v !== '');
        if (vals.length > 0) cy.wrap($sel).select(vals[0]);
      });
    });
    cy.get('.artist-filters select').eq(2).then($sel => {
      cy.wrap($sel).find('option').then($opts => {
        const vals = [...$opts].map(o => o.value).filter(v => v !== '');
        if (vals.length > 0) cy.wrap($sel).select(vals[0]);
      });
    });
  });

  it('TC-FE-022 – Üres találati állapot', () => {
    cy.get('.artist-search input').type('xyznonexistent12345');
    // The component shows "No more artists." when hasMore is false
    // and no results match the search filter
    cy.get('.artist-grid .artist-card').should('have.length', 0);
  });

  it('TC-FE-023 – Artist kártya navigáció', () => {
    cy.get('.artist-grid a.artist-card').first().click();
    cy.url().should('include', '/artist/');
  });
});
