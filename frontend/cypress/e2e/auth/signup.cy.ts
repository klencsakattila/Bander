describe('Regisztráció', () => {
  beforeEach(() => {
    cy.visit('/signup');
  });

  it('TC-FE-012 – Sign up oldal betöltése', () => {
    cy.get('[name="email"]').should('exist');
    cy.get('[name="password1"]').should('exist');
    cy.get('[name="password2"]').should('exist');
    cy.contains(/Sign up/i).should('exist');
  });

  it('TC-FE-013 – Kötelező mezők ellenőrzése', () => {
    cy.get('.btn-primary').contains(/Sign up/i).click();
    cy.contains(/email is required/i, { matchCase: false }).should('exist');
    cy.contains(/password is required/i, { matchCase: false }).should('exist');
    cy.contains(/Please retype the password/i, { matchCase: false }).should('exist');
  });

  it('TC-FE-014 – Jelszó megerősítés egyezése', () => {
    cy.get('[name="email"]').type('test+' + Date.now() + '@bander.test');
    cy.get('[name="password1"]').type('Password123!');
    cy.get('[name="password2"]').type('Password999!');
    cy.get('.btn-primary').contains(/Sign up/i).click();
    cy.contains(/do not match/i, { matchCase: false }).should('exist');
  });

  it('TC-FE-015 – Sikeres regisztráció UI folyamata', () => {
    cy.get('[name="email"]').type('test+' + Date.now() + '@bander.test');
    cy.get('[name="password1"]').type('Password123!');
    cy.get('[name="password2"]').type('Password123!');
    cy.get('.btn-primary').contains(/Sign up/i).click();
    cy.get('.form-grid > :nth-child(1)');
  });
});
