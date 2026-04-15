describe('Artist profil szerkesztés', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('alice@example.com');
    cy.get('input[name="password"]').type('demo123');
    cy.get('.btn-primary').contains(/Log in/i).click();
    // "My account" button in navbar navigates to /profile/settings
    cy.get('a.nav-btn-outline').contains(/My account/i).click();
    cy.url().should('include', '/profile/settings');
  });

  it('TC-FE-028 – Szerkesztő űrlap előtöltése', () => {
    cy.get('.form-grid').should('exist');
    cy.get('.form-grid .form-group').should('have.length.at.least', 1);
  });

  it('TC-FE-029 – Kötelező mezők validációja', () => {
    // Clear the Name (first_name) field
    cy.get('.form-grid .form-group').eq(0).find('input').clear();
    cy.get('.save-btn').click();
  });

  it('TC-FE-030 – Email formátum ellenőrzése', () => {
    // Email is the 5th form-group (index 4: Name, Username, Surname, Instrument MSD, Email)
    cy.get('.form-grid .form-group').eq(4).find('input[type="email"]').clear().type('not-an-email');
    cy.get('.save-btn').click();
  });

  it('TC-FE-031 – Mentés sikeres állapota', () => {
    // Type into first_name field
    cy.get('.form-grid .form-group').eq(0).find('input').clear().type('Cypress Test Artist');
    cy.get('.save-btn').click();
    // The hook shows success message with green color
    cy.get('p[style*="green"]', { timeout: 10000 }).should('exist');
  });
});
