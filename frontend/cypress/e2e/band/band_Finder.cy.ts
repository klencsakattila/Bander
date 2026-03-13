describe('Band kereső', () => {
  beforeEach(() => {
    cy.visit('/login')
    cy.get('input[type="email"]').type('alice@example.com');
    cy.get('input[type="password"]').type('demo123');
    cy.get('.btn-primary').contains(/Log in/i).click();

    cy.contains(/Manage band/i).should('exist');
    cy.get('.navbar-links > [href="/bands"]').click()
  });

  it('TC-FE-034 – Bands lista betöltése', () => {
    cy.get('.band-grid').should('have.length.at.least', 1);
  });

  it('TC-FE-035 – Szűrés város alapján', () => {
    cy.get('select').select('Los Angeles');
    cy.get('.band-grid').each(card => {
      cy.wrap(card).contains(/Los Angeles/i);
    });
  });

  it('TC-FE-036 – Szöveges kereső működése', () => {
    cy.get('input').type('Deep');
    cy.get('.band-grid').should('have.length.at.least', 1);
  });

  it('TC-FE-038 – Üres találati állapot', () => {
    cy.get('select').select('Aberdeen'); 
    cy.get('input').type('Deep');
    cy.get('[style="padding: 20px 0px; display: flex; justify-content: center;"] > button').click();
    cy.get('[style="padding: 20px 0px; display: flex; justify-content: center;"] > button').click();
    cy.contains(/no more bands/i, { matchCase: false }).should('be.visible');
  });
});
