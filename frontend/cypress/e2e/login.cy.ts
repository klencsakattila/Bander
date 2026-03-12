/// <reference types="cypress" />

describe("Artist page after login", () => {
  beforeEach(() => {
    cy.loginUI();
  });

  it("meg tudja nyitni az /artists oldalt", () => {
    cy.visit("/artists");
    cy.location("pathname").should("eq", "/artists");
  });
});

describe("Signup (real backend) + cleanup", () => {
  const API_BASE = "http://localhost:3000";
  const email = `e2e_${Date.now()}@test.com`;
  const password = "Test1234!";

  let createdUserId: number | null = null;

  afterEach(() => {
    cy.log("CLEANUP hook running...");
    if (createdUserId == null) {
      cy.log("No createdUserId -> skip cleanup");
      return;
    }

    cy.log(`Deleting user id=${createdUserId}`);
    cy.request({
      method: "DELETE",
      url: `${API_BASE}/users/${createdUserId}`,
      failOnStatusCode: false,
    }).then((res) => {
      cy.log(`Cleanup status=${res.status}`);
      expect([200, 202, 204]).to.include(res.status);
    });
  });

  it("signup -> artists -> first card -> capture id", () => {
    cy.visit("/signup");

    cy.get('[name="email"]').clear().type(email);
    cy.get('[name="password1"]').clear().type(password);
    cy.get('[name="password2"]').clear().type(password);
    cy.contains("button", /sign up/i).click();

    cy.visit("/artists");
    cy.get('a[href^="/artist/"]').first().click();

    cy.location("pathname").then((path) => {
      const m = path.match(/^\/artist\/(\d+)$/);
      expect(m, `Expected /artist/:id but got ${path}`).to.not.be.null;

      createdUserId = Number(m![1]);
      cy.log(`Captured createdUserId=${createdUserId}`);
    });
  });
});

describe('Bander – bejelentkezés', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('TC-FE-007 – Login oldal betöltése', () => {
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    cy.contains(/Log in/i).should('exist');
    cy.contains(/Get started/i).should('exist');
  });

  it('TC-FE-008 – Kötelező mezők', () => {
    cy.get('.btn-primary').contains(/Log in/i).click();

    cy.contains(/email is required/i, { matchCase: false }).should('exist');
    cy.contains(/password is required/i, { matchCase: false }).should('exist');
  });

  it('TC-FE-009 – Hibás hitelesítő adatok', () => {
    cy.get('input[type="email"]').type('wrong@example.com');
    cy.get('input[type="password"]').type('Wrong1234!');
    cy.get('.btn-primary').contains(/Log in/i).click();

    cy.get('.error-text').contains("[POST] http://localhost:3000/users/login -> 401 Unauthorized Incorrect email or password.").should('exist');
  });

  it('TC-FE-010 – Sikeres bejelentkezés UI', () => {
    cy.get('input[type="email"]').type('alice@example.com');
    cy.get('input[type="password"]').type('demo123');
    cy.get('.btn-primary').contains(/Log in/i).click();

    cy.contains(/Manage band/i).should('exist');
  });

  it('TC-FE-011 – Get started navigáció', () => {
    cy.get('.btn-secondary').contains(/Get started/i).click();
    cy.url().should('include', '/signup');
  });
});
