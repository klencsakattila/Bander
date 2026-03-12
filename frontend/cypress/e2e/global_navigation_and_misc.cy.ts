describe('Globális navigáció és egyéb', () => {
  it('TC-FE-057 – Publikus fejléc linkek működése', () => {
    cy.visit('/');
    cy.contains(/Artists/i).click();
    cy.url().should('include', '/artists');

    cy.contains(/Bands/i).click();
    cy.url().should('include', '/bands');

    cy.contains(/Log in/i).click();
    cy.url().should('include', '/login');
  });

  it('TC-FE-058 – Bejelentkezett állapot fejléc megjelenése', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('demo@bander.test');
    cy.get('input[type="password"]').type('Demo1234!');
    cy.contains(/Log in/i).click();

    cy.get('[data-testid="header-logged-in"]').within(() => {
      cy.contains(/Messages/i).should('exist');
      cy.contains(/Profile/i).should('exist');
    });
  });

  it('TC-FE-059 – Mentések / küldések vizuális visszajelzése', () => {
    cy.visit('/bands/manage');
    cy.get('input[name="name"]').type(' ');
    cy.contains(/Save Details/i).click();
    cy.contains(/saved/i, { matchCase: false }).should('exist');
  });

  it('TC-FE-060 – Reszponzivitás – mobil nézet', () => {
    cy.viewport('iphone-6');
    cy.visit('/artists');
    cy.get('[data-testid="artist-card"]').first().scrollIntoView().should('be.visible');
    cy.get('select[name="city"]').should('be.visible');
  });
});
