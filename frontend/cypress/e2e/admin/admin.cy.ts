describe('Admin dashboard', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('admin@example.com');
    cy.get('input[name="password"]').type('demo123');
    cy.get('.btn-primary').contains(/Log in/i).click();
    cy.get('[href="/admin"]').click();
  });

  it('TC-FE-052 – Admin dashboard betöltése', () => {
    // Stats cards exist with these labels
    cy.get('.adm-stat-label').contains(/Users/i).should('exist');
    cy.get('.adm-stat-label').contains(/Bands/i).should('exist');
    cy.get('.adm-stat-label').contains(/Reports/i).should('exist');
    cy.get('.adm-stat-label').contains(/Events/i).should('exist');
  });

  it('TC-FE-053 – Reports tábla megjelenítése', () => {
    cy.get('.adm-main').within(() => {
      cy.contains('th', /ID/i);
      cy.contains('th', /Reporter/i);
      cy.contains('th', /Subject/i);
      cy.contains('th', /Status/i);
    });
  });

  it('TC-FE-054 – Felhasználó tiltás UI', () => {
    // Switch to Manual Actions tab (2nd tab button)
    cy.get('.adm-tabs .adm-tab').contains(/Manual Actions/i).click();

    // Fill in Ban User form
    cy.get('.adm-actions-grid .adm-card').first().within(() => {
      cy.get('.adm-input').first().type('123');
      cy.contains(/Ban User/i).click();
    });
  });

  it('TC-FE-055 – Band tiltás UI', () => {
    // Switch to Manual Actions tab
    cy.get('.adm-tabs .adm-tab').contains(/Manual Actions/i).click();

    // Ban Band is the 2nd card in actions grid
    cy.get('.adm-actions-grid .adm-card').eq(1).within(() => {
      cy.get('.adm-input').first().type('123');
      cy.get('.adm-input').eq(1).type('Cypress test reason');
      cy.contains(/Ban Band/i).click();
    });
  });

  it('TC-FE-056 – Poszt törlés UI', () => {
    // Switch to Manual Actions tab
    cy.get('.adm-tabs .adm-tab').contains(/Manual Actions/i).click();

    // Delete Event is the 3rd card in actions grid
    cy.get('.adm-actions-grid .adm-card').eq(2).within(() => {
      cy.get('.adm-input').first().type('123');
      cy.get('.adm-input').eq(1).type('Cypress test reason');
      cy.contains(/Delete Event/i).click();
    });
  });
});
