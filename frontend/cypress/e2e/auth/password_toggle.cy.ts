describe('Jelszó megjelenítés/elrejtés', () => {
  it('TC-FE-082 – Login jelszó toggle', () => {
    cy.visit('/login');
    const pwInput = 'input[name="password"]';

    // Initially password type
    cy.get(pwInput).should('have.attr', 'type', 'password');

    // Click the toggle
    cy.get('.toggle-password').click();
    cy.get(pwInput).should('have.attr', 'type', 'text');

    // Click again to hide
    cy.get('.toggle-password').click();
    cy.get(pwInput).should('have.attr', 'type', 'password');
  });

  it('TC-FE-083 – Signup jelszó mezők toggle', () => {
    cy.visit('/signup');

    // First password field
    cy.get('input[name="password1"]').should('have.attr', 'type', 'password');
    cy.get('.toggle-password').first().click();
    cy.get('input[name="password1"]').should('have.attr', 'type', 'text');

    // Second password field
    cy.get('input[name="password2"]').should('have.attr', 'type', 'password');
    cy.get('.toggle-password').eq(1).click();
    cy.get('input[name="password2"]').should('have.attr', 'type', 'text');
  });
});
