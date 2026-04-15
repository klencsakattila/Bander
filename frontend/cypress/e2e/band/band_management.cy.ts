describe('Band kezelő oldal', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('alice@example.com');
    cy.get('input[name="password"]').type('demo123');
    cy.get('.btn-primary').contains(/Log in/i).click();

    // Wait for band manage link to appear, then click it
    cy.contains(/Manage band/i, { timeout: 10000 }).should('exist');
    cy.get('.navbar-links a').contains(/Manage band/i).click();
    cy.url().should('include', '/bands/manage/');
  });

  it('TC-FE-045 – Band szerkesztő űrlap előtöltése', () => {
    cy.get('.band-forms').should('exist');
  });

  it('TC-FE-046 – Band adatok mentése', () => {
    // Band name input is in the first form-col, first field
    cy.get('.band-forms .form-col').first().within(() => {
      cy.get('.field input').first().clear().type('Cypress Test Band');
      cy.contains('button', /Save changes/i).click();
    });
    // Status toast shows "Saved!"
    cy.get('.toast', { timeout: 5000 }).should('exist');
  });

  it('TC-FE-047 – Új esemény űrlap mezői', () => {
    // New Event is in the second form-col
    cy.get('.band-forms .form-col').eq(1).within(() => {
      cy.get('select').should('exist');     // post_type select
      cy.get('textarea').should('exist');   // post_message
      cy.get('input[type="date"]').should('exist'); // expires_at
    });
  });

  it('TC-FE-048 – Új esemény validációja', () => {
    // Try creating event without filling fields
    cy.get('.band-forms .form-col').eq(1).within(() => {
      cy.contains('button', /Create event/i).click();
    });
    // Error message should appear (e.g. "Message is required")
    cy.contains(/required/i, { matchCase: false }).should('exist');
  });

  it('TC-FE-049 – Új esemény létrehozása', () => {
    cy.get('.band-forms .form-col').eq(1).within(() => {
      cy.get('input[type="date"]').type('2030-01-01');
      cy.get('textarea').type('Created by Cypress test.');
      cy.contains('button', /Create event/i).click();
    });
    // Success toast: "Event created!"
    cy.get('.toast', { timeout: 5000 }).should('contain.text', 'Event created');
  });
});
