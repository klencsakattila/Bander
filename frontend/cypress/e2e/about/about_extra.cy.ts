describe('About oldal – extra tesztek', () => {
  beforeEach(() => {
    cy.visit('/about');
  });

  it('TC-FE-087 – About oldal szöveg tartalma', () => {
    cy.get('.about-text').should('exist');
    cy.get('.about-text p').should('have.length.at.least', 3);
    // Text should be substantial (not empty)
    cy.get('.about-text p').first().invoke('text').should('have.length.greaterThan', 20);
  });
});
