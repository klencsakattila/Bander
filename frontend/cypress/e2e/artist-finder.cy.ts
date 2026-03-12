describe('Artist kereső', () => {
  beforeEach(() => {
    cy.visit('/login')
    cy.get('input[type="email"]').type('alice@example.com');
    cy.get('input[type="password"]').type('demo123');
    cy.get('.btn-primary').contains(/Log in/i).click();

    cy.contains(/Manage band/i).should('exist');
    cy.get('.navbar-links > [href="/artists"]').click()
  });

  it('TC-FE-016 – Artists lista betöltése', () => {
    cy.get('.artist-finder-layout').should('have.length.at.least', 1);
    cy.get('.artist-card')
      .first()
      .within(() => {
        cy.contains('robert_trujillo').should('exist'); // username
      });
  });

  it('TC-FE-017 – Szöveges kereső működése', () => {
    cy.get('input').type('guitar');
    cy.get('.artist-card').should('have.length.at.least', 1);
  });

  it('TC-FE-018 – Szűrés város alapján', () => {
    cy.get('.artist-filters > :nth-child(2)').should('be.visible').select('Budapest');
    cy.get('.artist-card').each(card => {
      cy.wrap(card).contains(/Budapest/i);
    });
  });

  it('TC-FE-019 – Szűrés hangszer alapján', () => {
    cy.get('.artist-filters > :nth-child(4)').should('be.visible').select('Electric Guitar');
    cy.get('.artist-card').each(card => {
      cy.wrap(card).contains(/Guitar/i);
    });
  });

  it('TC-FE-020 – Szűrés műfaj alapján', () => {
    cy.get('.artist-filters > :nth-child(6)').should('be.visible').select('Blues');
    cy.get('.artist-card').each(card => {
      cy.wrap(card).contains(/Blues/i);
    });
  });

  it('TC-FE-021 – Több szűrő kombinálása', () => {
    cy.get('.artist-filters > :nth-child(2)').should('be.visible').select('Budapest');
    cy.get('.artist-filters > :nth-child(4)').should('be.visible').select('Keys');
    cy.get('.artist-filters > :nth-child(6)').should('be.visible').select('Blues');
    cy.get('.artist-card').each(card => {
      cy.wrap(card).contains(/Budapest/i);
      cy.wrap(card).contains(/Keys/i);
      cy.wrap(card).contains(/Blues/i);
    });
  });

  it('TC-FE-022 – Üres találati állapot', () => {
    cy.get('input').type('asdasdasdasdasd');;
    cy.get('[style="padding: 20px; display: flex; justify-content: center;"] > button').click();
    cy.get('[style="padding: 20px; display: flex; justify-content: center;"] > button').click();
    cy.contains(/No more artists./i, { matchCase: false }).should('exist');
  });

  it('TC-FE-023 – Artist kártya navigáció', () => {
    cy.get('[href="/artist/29"]').click();
    cy.url().should('include', '/artist/');
  });
});
