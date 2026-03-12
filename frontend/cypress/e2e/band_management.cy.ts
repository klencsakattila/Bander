describe('Band kezelő oldal', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('bandadmin@bander.test');
    cy.get('input[type="password"]').type('BandAdmin123!');
    cy.contains(/Log in/i).click();
    cy.visit('/bands/manage');
  });

  it('TC-FE-045 – Band szerkesztő űrlap előtöltése', () => {
    cy.get('[data-testid="band-edit-form"]').within(() => {
      cy.get('input[name="name"]').should('have.value');
      cy.get('input[name="email"]').should('have.value');
    });
  });

  it('TC-FE-046 – Band adatok mentése', () => {
    cy.get('input[name="name"]').clear().type('Cypress Test Band');
    cy.contains(/Save Details/i).click();
    cy.contains(/saved/i, { matchCase: false }).should('exist');
  });

  it('TC-FE-047 – Új esemény űrlap mezői', () => {
    cy.get('[data-testid="new-event-form"]').within(() => {
      cy.get('input[name="name"]').should('exist');
      cy.get('input[name="date"]').should('exist');
      cy.get('textarea[name="description"]').should('exist');
      cy.contains(/Set up new Event!/i).should('exist');
    });
  });

  it('TC-FE-048 – Új esemény validációja', () => {
    cy.get('[data-testid="new-event-form"]').within(() => {
      cy.contains(/Set up new Event!/i).click();
    });
    cy.contains(/required/i, { matchCase: false }).should('exist');
  });

  it('TC-FE-049 – Új esemény létrehozása', () => {
    cy.get('[data-testid="new-event-form"]').within(() => {
      cy.get('input[name="name"]').type('Cypress Festival');
      cy.get('input[name="date"]').type('2030-01-01');
      cy.get('textarea[name="description"]').type('Created by Cypress test.');
      cy.contains(/Set up new Event!/i).click();
    });
    cy.contains(/Event created/i, { matchCase: false }).should('exist');
  });
});
