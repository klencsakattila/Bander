describe('Band létrehozás és tagkezelés', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('alice@example.com');
    cy.get('input[name="password"]').type('demo123');
    cy.get('.btn-primary').contains(/Log in/i).click();

    cy.contains(/Manage band|Create band/i).should('exist');
  });

  it('TC-FE-068 – Új band létrehozása (navigáció a create oldalra)', () => {
    // If user already has a band, this will be "Manage band"
    // We test that the create/manage page loads with the band-forms section
    cy.get('.navbar-links a').contains(/Manage band|Create band/i).click();
    cy.url().should('match', /\/bands\/(manage|create)/);
    cy.get('.band-forms').should('exist');
    // The first form-col should have band name and city inputs
    cy.get('.band-forms .form-col').first().within(() => {
      cy.get('.field input').should('have.length.at.least', 1);
    });
  });

  it('TC-FE-069 – Tag hozzáadása', () => {
    cy.get('.navbar-links a').contains(/Manage band/i).click();
    cy.url().should('include', '/bands/manage/');

    cy.get('.band-forms .form-col').first().within(() => {
      // The "Add member" section should have User select and Role select
      cy.contains(/Add member/i).should('exist');
      cy.get('select').should('have.length.at.least', 1);
    });
  });

  it('TC-FE-070 – Band avatar feltöltés UI', () => {
    cy.get('.navbar-links a').contains(/Manage band/i).click();
    cy.url().should('include', '/bands/manage/');

    // Band Images section is in the third form-col
    cy.get('.band-forms .form-col').eq(2).within(() => {
      cy.contains(/Band Images/i).should('exist');
      cy.get('.band-media-block').should('have.length.at.least', 1);
      // Avatar picker should exist
      cy.get('.band-avatar-picker').should('exist');
    });
  });

  it('TC-FE-071 – Band banner feltöltés UI', () => {
    cy.get('.navbar-links a').contains(/Manage band/i).click();
    cy.url().should('include', '/bands/manage/');

    cy.get('.band-forms .form-col').eq(2).within(() => {
      // Banner picker should exist
      cy.get('.band-banner-picker').should('exist');
    });
  });
});
