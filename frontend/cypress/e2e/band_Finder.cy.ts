describe('Band kereső', () => {
  beforeEach(() => {
    cy.visit('/bands');
  });

  it('TC-FE-034 – Bands lista betöltése', () => {
    cy.get('[data-testid="band-card"]').should('have.length.at.least', 1);
    cy.get('[data-testid="band-card"]').first().within(() => {
      cy.contains(/open spots/i, { matchCase: false }).should('exist');
    });
  });

  it('TC-FE-035 – Szűrés város alapján', () => {
    cy.get('select[name="city"]').select('Budapest');
    cy.get('[data-testid="band-card"]').each(card => {
      cy.wrap(card).contains(/Budapest/i);
    });
  });

  it('TC-FE-036 – Szűrés keresett hangszer alapján', () => {
    cy.get('select[name="instrumentNeeded"]').select('Guitar');
    cy.get('[data-testid="band-card"]').each(card => {
      cy.wrap(card).contains(/Guitar/i);
    });
  });

  it('TC-FE-037 – Szűrés műfaj alapján', () => {
    cy.get('select[name="genre"]').select('Rock');
    cy.get('[data-testid="band-card"]').each(card => {
      cy.wrap(card).contains(/Rock/i);
    });
  });

  it('TC-FE-038 – Üres találati állapot', () => {
    cy.get('select[name="city"]').select('Aberdeen'); // vagy más "üres" város
    cy.contains(/no results/i, { matchCase: false }).should('be.visible');
  });
});
