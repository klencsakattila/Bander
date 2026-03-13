describe('Üzenetek', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('demo@bander.test');
    cy.get('input[type="password"]').type('Demo1234!');
    cy.contains(/Log in/i).click();
    cy.visit('/messages');
  });

  it('TC-FE-032 – Beszélgetéslista és üzenetnézet betöltése', () => {
    cy.get('[data-testid="conversation-list"]').should('be.visible');
    cy.get('[data-testid="conversation-list"] [data-testid="conversation-item"]')
      .first()
      .click();
    cy.get('[data-testid="message-thread"]').should('be.visible');
    cy.get('[data-testid="message-input"]').should('be.visible');
  });

  it('TC-FE-033 – Hosszabb üzenetlista görgethetősége', () => {
    cy.get('[data-testid="conversation-item"]').first().click();
    cy.get('[data-testid="message-thread"]')
      .scrollTo('bottom')
      .scrollTo('top');
  });
});
