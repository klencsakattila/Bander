describe('Report rendszer – Artist kereső', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('alice@example.com');
    cy.get('input[name="password"]').type('demo123');
    cy.get('.btn-primary').contains(/Log in/i).click();

    cy.contains(/Manage band|Create band/i).should('exist');
  });

  it('TC-FE-065 – Report gomb artist kártyán', () => {
    cy.get('.navbar-links > [href="/artists"]').click();
    cy.get('.artist-grid .artist-card').should('have.length.at.least', 1);
    // Click the Report button on the first artist card
    cy.get('.artist-grid .artist-card').first().find('.artist-report-btn').click();
    // ReportModal should appear (rendered via portal to body)
    cy.get('.report-modal').should('exist');
    cy.get('.report-modal-header h3').should('exist');
  });

  it('TC-FE-066 – Report gomb az artist profiloldalon', () => {
    cy.get('.navbar-links > [href="/artists"]').click();
    cy.get('.artist-grid a.artist-card').first().click();
    cy.url().should('include', '/artist/');
    // Click the report button on the profile page
    cy.get('.report-btn').should('exist').click();
    cy.get('.report-modal').should('exist');
  });

  it('TC-FE-067 – Report gomb band kártyán', () => {
    cy.get('.navbar-links > [href="/bands"]').click();
    cy.get('.band-grid .band-card').should('have.length.at.least', 1);
    cy.get('.band-grid .band-card').first().find('.band-report-btn').click();
    cy.get('.report-modal').should('exist');
  });
});
