/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

/// <reference types="cypress" />

Cypress.Commands.add("loginUI", () => {
  cy.visit("/login");

  cy.get('input[name="email"], input[type="email"]')
    .first()
    .clear()
    .type("e2e@test.com");

  cy.get('input[name="password"], input[type="password"]')
    .first()
    .clear()
    .type("Test1234!");

  cy.get(".btn-primary").click();

  // várjuk meg hogy tényleg kilépjen a login route-ról
  cy.location("pathname").should("not.eq", "/login");

  // alap sanity check
  cy.get("h1").should("be.visible");
});

declare global {
  namespace Cypress {
    interface Chainable {
      loginUI(): Chainable<void>;
    }
  }
}

export {};