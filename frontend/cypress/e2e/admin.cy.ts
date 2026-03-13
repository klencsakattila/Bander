describe('Admin dashboard', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('demo123');
    cy.get('.btn-primary').contains(/Log in/i).click();
    cy.get('[href="/admin"]').click();
  });

  it('TC-FE-052 – Admin dashboard betöltése', () => {
    cy.contains(/Users/i).should('exist');
    cy.contains(/Bands/i).should('exist');
    cy.contains(/Reports/i).should('exist');
    cy.contains(/Events/i).should('exist');
  });

  it('TC-FE-053 – Reports tábla megjelenítése', () => {
    cy.get('.adm-main').within(() => {
      cy.contains(/ID/i);
      cy.contains(/Reporter/i);
      cy.contains(/Subject/i);
      cy.contains(/Status/i);
    });
  });

  it('TC-FE-054 – Felhasználó tiltás UI', () => {
    cy.get('.adm-tabs > :nth-child(2)').click();
    cy.get('.adm-actions-grid > :nth-child(1)')
    cy.get(':nth-child(1) > .adm-form > .adm-form-row > :nth-child(1) > .adm-input').type('123');
    cy.contains(/Ban user/i).click();
    cy.contains(/success/i, { matchCase: false }).should('exist');
  });

  it('TC-FE-055 – Band tiltás UI', () => {
    cy.get('[data-testid="ban-band-form"]').within(() => {
      cy.get('input[name="bandId"]').type('123');
      cy.get('textarea[name="reason"]').type('Cypress test reason');
      cy.contains(/Ban band/i).click();
    });
    cy.contains(/success/i, { matchCase: false }).should('exist');
  });

  it('TC-FE-056 – Poszt törlés UI', () => {
    cy.get('[data-testid="delete-post-form"]').within(() => {
      cy.get('input[name="postId"]').type('123');
      cy.get('textarea[name="reason"]').type('Cypress test reason');
      cy.contains(/Delete post/i).click();
    });
    cy.contains(/success/i, { matchCase: false }).should('exist');
  });
});
