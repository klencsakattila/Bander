/// <reference types="cypress" />

describe('Message routes', () => {
  const base = Cypress.config('baseUrl') || 'http://localhost:3000'
  const prefix = '/message'

  let authToken: string | null = null

  const genRandomUser = () => {
    const t = Math.random().toString(36).substring(2, 6)
    return {
      name: `testuser-${t}`,
      email: `testuser${t}@example.com`,
      password: 'Password123!'
    }
  }

  before(() => {
    const userData = genRandomUser()
    // Register user
    cy.request({
      method: 'POST',
      url: `${base}/users/register`,
      body: userData,
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.be.within(200, 299)
      // Decode JWT to get user id
      const token = resp.body?.token
      if (token) {
        authToken = token
      }
    })
  })

  it('POST /message without token -> unauthorized', () => {
    cy.request({
      method: 'POST',
      url: `${base}${prefix}`,
      body: { thread_id: 1, sender_id: 1, message: 'test' },
      failOnStatusCode: false
    }).then((resp) => {
      expect([401, 403]).to.include(resp.status)
    })
  })

  it('POST /message -> 400 when required fields are missing', () => {
    cy.request({
      method: 'POST',
      url: `${base}${prefix}`,
      headers: { 'x-access-token': authToken },
      body: {},
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.eq(400)
    })
  })

  it('POST /message -> 400 for invalid thread_id/sender_id', () => {
    cy.request({
      method: 'POST',
      url: `${base}${prefix}`,
      headers: { 'x-access-token': authToken },
      body: { thread_id: 'abc', sender_id: 'xyz', message: 'hello' },
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.eq(400)
    })
  })

  it('POST /message -> 404 for non-existent thread', () => {
    cy.request({
      method: 'POST',
      url: `${base}${prefix}`,
      headers: { 'x-access-token': authToken },
      body: { thread_id: 999999, sender_id: 1, message: 'hello' },
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.eq(404)
    })
  })

  it('DELETE /message/:id without token -> unauthorized', () => {
    cy.request({
      method: 'DELETE',
      url: `${base}${prefix}/1`,
      failOnStatusCode: false
    }).then((resp) => {
      expect([401, 403]).to.include(resp.status)
    })
  })

  it('DELETE /message/:id -> 400 for invalid id', () => {
    cy.request({
      method: 'DELETE',
      url: `${base}${prefix}/abc`,
      headers: { 'x-access-token': authToken },
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.eq(400)
    })
  })

  it('DELETE /message/:id -> 404 when message does not exist', () => {
    cy.request({
      method: 'DELETE',
      url: `${base}${prefix}/999999999`,
      headers: { 'x-access-token': authToken },
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.eq(404)
    })
  })
})