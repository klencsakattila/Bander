describe('Üzenetek', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('alice@example.com');
    cy.get('input[name="password"]').type('demo123');
    cy.get('.btn-primary').contains(/Log in/i).click();

    // Navigate to an artist profile and click "Send a message"
    cy.get('.navbar-links > [href="/artists"]').click();
    cy.get('.artist-grid a.artist-card').first().click();
    cy.url().should('include', '/artist/');
    cy.contains('button', /Send a message/i).click();
    cy.url().should('include', '/message/');
  });

  it('TC-FE-032 – Üzenetnézet betöltése', () => {
    cy.get('.messages-page').should('be.visible');
    cy.get('.messages-header').should('be.visible');
    cy.get('.messages-list').should('be.visible');
    cy.get('.message-input').should('be.visible');
    cy.get('.message-input input[type="text"]').should('be.visible');
  });

  it('TC-FE-033 – Üzenet küldése', () => {
    cy.get('.message-input input[type="text"]').type('Cypress test message');
    cy.get('.message-input button[type="submit"]').click();
    // The new message should appear in the messages list
    cy.get('.messages-list .message-bubble').should('have.length.at.least', 1);
  });
});
