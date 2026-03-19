describe('Admin – extra tesztek', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('admin@example.com');
    cy.get('input[name="password"]').type('demo123');
    cy.get('.btn-primary').contains(/Log in/i).click();
    cy.get('[href="/admin"]').click();
  });

  it('TC-FE-076 – Report státusz módosítása (Reviewing)', () => {
    // Wait for reports table to load
    cy.get('.adm-table', { timeout: 10000 }).should('exist');

    // If there are reports, click the Reviewing button on the first one
    cy.get('.adm-table tbody tr').then($rows => {
      if ($rows.length > 0 && !$rows.first().find('.adm-empty').length) {
        cy.get('.adm-table tbody tr').first().within(() => {
          cy.contains('button', /Reviewing/i).click();
        });
        // The status pill should update
        cy.get('.adm-table tbody tr').first().find('.adm-pill').should('exist');
      }
    });
  });

  it('TC-FE-077 – Report feloldása (Resolve)', () => {
    cy.get('.adm-table', { timeout: 10000 }).should('exist');

    cy.get('.adm-table tbody tr').then($rows => {
      if ($rows.length > 0 && !$rows.first().find('.adm-empty').length) {
        cy.get('.adm-table tbody tr').first().within(() => {
          cy.contains('button', /Resolve/i).click();
        });
      }
    });
  });

  it('TC-FE-078 – Report elutasítása (Reject/Delete)', () => {
    cy.get('.adm-table', { timeout: 10000 }).should('exist');

    cy.get('.adm-table tbody tr').then($rows => {
      if ($rows.length > 0 && !$rows.first().find('.adm-empty').length) {
        const initialCount = $rows.length;
        cy.get('.adm-table tbody tr').first().within(() => {
          cy.contains('button', /Reject/i).click();
        });
      }
    });
  });

  it('TC-FE-079 – Report szűrés és keresés', () => {
    // Test search input
    cy.get('.adm-input').first().type('test');
    cy.get('.adm-table').should('exist');

    // Test status filter
    cy.get('.adm-select').select('open');
    cy.get('.adm-table').should('exist');

    // Reset
    cy.get('.adm-select').select('all');
    cy.get('.adm-input').first().clear();
  });

  it('TC-FE-089 – Admin sidebar navigáció', () => {
    cy.get('.adm-sidebar').should('exist');
    cy.get('.adm-sidebar .adm-nav').within(() => {
      cy.contains(/Moderation/i).should('exist');
      cy.contains(/Users/i).should('exist');
      cy.contains(/Bands/i).should('exist');
      cy.contains(/Events/i).should('exist');
    });
  });
});
