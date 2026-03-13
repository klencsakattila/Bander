describe('Artist profil szerkesztés', () => {
  beforeEach(() => {
    cy.visit('/login')
    cy.get('input[type="email"]').type('alice@example.com');
    cy.get('input[type="password"]').type('demo123');
    cy.get('.btn-primary').contains(/Log in/i).click();
    cy.get('.nav-btn-outline').click();
  });

  it('TC-FE-028 – Szerkesztő űrlap előtöltése', () => {
    cy.get('.form-grid')
  });

  it('TC-FE-029 – Kötelező mezők validációja', () => {
    cy.get('input[name="displayName"]').clear();
    cy.contains(/Save Details/i).click();
    cy.contains(/required/i, { matchCase: false }).should('exist');
  });

  it('TC-FE-030 – Email formátum ellenőrzése', () => {
    cy.get(':nth-child(5) > input').clear().type('not-an-email');
    cy.contains(/Save Details/i).click();
    cy.contains(/valid email/i, { matchCase: false }).should('exist');
  });

  it('TC-FE-031 – Mentés sikeres állapota', () => {
    cy.get('input[name="displayName"]').clear().type('Cypress Test Artist');
    cy.contains(/Save Details/i).click();
    cy.contains(/saved/i, { matchCase: false }).should('exist');
  });
});
