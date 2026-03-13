describe('Band profil', () => {
  beforeEach(() => {
    cy.visit('/bands');
    cy.get('[data-testid="band-card"]').first().click();
  });

  it('TC-FE-039 – Band adatlap megjelenítése', () => {
    cy.get('[data-testid="band-profile"]').within(() => {
      cy.contains(/Members/i).should('exist');
      cy.contains(/Open spots/i).should('exist');
    });
  });

  it('TC-FE-040 – Jelentkezési űrlap mezői', () => {
    cy.get('[data-testid="band-application-form"]').within(() => {
      cy.get('input[name="name"]').should('exist');
      cy.get('input[name="instrument"]').should('exist');
      cy.contains(/Send Application/i).should('exist');
    });
  });

  it('TC-FE-041 – Jelentkezési űrlap validációja', () => {
    cy.get('[data-testid="band-application-form"]').within(() => {
      cy.contains(/Send Application/i).click();
    });
    cy.contains(/required/i, { matchCase: false }).should('exist');
  });

  it('TC-FE-042 – Sikeres jelentkezés UI folyamata', () => {
    cy.get('[data-testid="band-application-form"]').within(() => {
      cy.get('input[name="name"]').type('Cypress Tester');
      cy.get('input[name="instrument"]').type('Guitar');
      cy.contains(/Send Application/i).click();
    });
    cy.contains(/success/i, { matchCase: false }).should('exist');
  });

  it('TC-FE-043 – Current members blokk', () => {
    cy.contains(/Current members/i).scrollIntoView();
    cy.get('[data-testid="band-members"] li').should('have.length.at.least', 1);
  });

  it('TC-FE-044 – Upcoming events blokk', () => {
    cy.contains(/Upcoming events/i).scrollIntoView();
    cy.get('[data-testid="band-events"] [data-testid="event-card"]').should(
      'have.length.at.least',
      1,
    );
  });
});
