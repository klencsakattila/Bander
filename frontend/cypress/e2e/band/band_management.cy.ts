describe('Band kezelő oldal', () => {
  beforeEach(() => {
        cy.visit('/login')
    cy.get('input[type="email"]').type('alice@example.com');
    cy.get('input[type="password"]').type('demo123');
    cy.get('.btn-primary').contains(/Log in/i).click();

    cy.contains(/Manage band/i).should('exist');
    cy.get('[href="/bands/manage/6"]').click();
  });

  it('TC-FE-045 – Band szerkesztő űrlap előtöltése', () => {
    cy.get('.band-forms').should('exist');
  });

  it('TC-FE-046 – Band adatok mentése', () => {
    cy.get('.band-forms > :nth-child(1) > :nth-child(2) > input').clear().type('Cypress Test Band');
    cy.contains(/Save Changes/i).click();
    cy.contains(/saved/i, { matchCase: false }).should('exist');
  });

  it('TC-FE-047 – Új esemény űrlap mezői', () => {
    cy.get('.band-forms > :nth-child(2)').within(() => {
      cy.get(':nth-child(2) > select').should('exist');
      cy.get(':nth-child(4) > input').should('exist');
      cy.get('textarea').should('exist');
    });
  });

  it('TC-FE-048 – Új esemény validációja', () => {
    cy.get('[data-testid="new-event-form"]').within(() => {
      cy.get('.band-forms > :nth-child(2) > .btn').click();
    });
    cy.contains(/message/i, { matchCase: false }).should('exist');
  });

  it('TC-FE-049 – Új esemény létrehozása', () => {
    cy.get('[data-testid="new-event-form"]').within(() => {
      cy.get(':nth-child(4) > input').type('2030-01-01');
      cy.get('textarea').type('Created by Cypress test.');
      cy.get('.band-forms > :nth-child(2) > .btn').click();
    });
    cy.contains(/Event created/i, { matchCase: false }).should('exist');
  });
});
