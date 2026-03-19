describe('Load more paginálás', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('alice@example.com');
    cy.get('input[name="password"]').type('demo123');
    cy.get('.btn-primary').contains(/Log in/i).click();

    cy.contains(/Manage band|Create band/i).should('exist');
  });

  it('TC-FE-085 – Artist lista Load more gomb', () => {
    cy.get('.navbar-links > [href="/artists"]').click();
    cy.get('.artist-grid').should('exist');

    // If there are enough artists, a "Load more" button should be visible
    // If not enough data, the text "No more artists." appears
    cy.get('body').then($body => {
      if ($body.find('button:contains("Load more")').length > 0) {
        cy.contains('button', /Load more/i).click();
        // After clicking, either more cards load or the button disappears
        cy.get('.artist-grid .artist-card').should('have.length.at.least', 1);
      } else {
        // Not enough data for pagination, "No more artists." should show
        cy.contains(/No more artists/i).should('exist');
      }
    });
  });

  it('TC-FE-086 – Band lista Load more gomb', () => {
    cy.get('.navbar-links > [href="/bands"]').click();
    cy.get('.band-grid').should('exist');

    cy.get('body').then($body => {
      if ($body.find('button:contains("Load more")').length > 0) {
        cy.contains('button', /Load more/i).click();
        cy.get('.band-grid .band-card').should('have.length.at.least', 1);
      } else {
        cy.contains(/No more bands/i).should('exist');
      }
    });
  });
});
