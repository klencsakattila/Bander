describe('About oldal', () => {
  beforeEach(() => {
    cy.visit('/about');
  });

  it('TC-FE-050 – About oldal tartalma', () => {
    cy.contains(/About Bander/i).should('be.visible');
    cy.contains(/Terms and Conditions/i).should('be.visible');
  });

  it('TC-FE-051 – Terms and Conditions CTA', () => {
    cy.get('.about-link').contains(/Terms and Conditions/i)
      .should('have.attr', 'href')
      .then(href => {
        expect(href).to.match(/terms/i);
      });
  });
});
