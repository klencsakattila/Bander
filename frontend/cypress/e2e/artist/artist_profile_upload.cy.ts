describe('Artist profil – képfeltöltés és multi-select', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('alice@example.com');
    cy.get('input[name="password"]').type('demo123');
    cy.get('.btn-primary').contains(/Log in/i).click();
    cy.get('a.nav-btn-outline').contains(/My account/i).click();
    cy.url().should('include', '/profile/settings');
  });

  it('TC-FE-072 – Profilkép feltöltés mező megjelenése', () => {
    // The ImageUploadField for profile picture should exist
    cy.contains(/Profile picture/i).should('exist');
    // The form-group with ImageUploadField spans full width
    cy.get('.form-grid .form-group').last().should('exist');
  });

  it('TC-FE-081 – Multi-select instrument és stílus választás', () => {
    // MultiSelectDropdown for instruments
    cy.get('.msd').should('have.length.at.least', 2);

    // Click the first MSD trigger (Instruments)
    cy.get('.msd').first().within(() => {
      cy.get('.msd-trigger').click();
      cy.get('.msd-menu').should('exist');
      // Click first item if available
      cy.get('.msd-item').first().click();
    });

    // Click the second MSD trigger (Styles)
    cy.get('.msd').eq(1).within(() => {
      cy.get('.msd-trigger').click();
      cy.get('.msd-menu').should('exist');
      cy.get('.msd-item').first().click();
    });
  });
});
