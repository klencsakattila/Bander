/// <reference types="cypress" />

describe('Instrument routes', () => {
  const base = Cypress.config('baseUrl') || 'http://localhost:3000'
  const prefix = '/instrument'

  let instrumentId: number | null = null
  let authToken: string | null = null

  const extractId = (body: any): number | null =>
    body?.id ?? body?._id ?? body?.instrument?.id ?? null

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

  it('GET /instrument -> returns all instruments', () => {
    cy.request({
      method: 'GET',
      url: `${base}${prefix}`,
      headers: { 'x-access-token': authToken },
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.eq(200)
      expect(Array.isArray(resp.body)).to.eq(true)
      if (resp.body.length > 0) instrumentId = extractId(resp.body[0])
    })
  })

  it('GET /instrument/:id -> returns one instrument (if any exists)', function () {
    if (!instrumentId) this.skip()

    cy.request({
      method: 'GET',
      url: `${base}${prefix}/${instrumentId}`,
      headers: { 'x-access-token': authToken },
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.eq(200)
      expect(resp.body).to.have.property('id')
      expect(resp.body).to.have.property('name')
    })
  })

  it('GET /instrument/:id with invalid id -> 400', () => {
    cy.request({
      method: 'GET',
      url: `${base}${prefix}/abc`,
      headers: { 'x-access-token': authToken },
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.eq(400)
    })
  })

  it('POST /instrument without token -> unauthorized/forbidden', () => {
    cy.request({
      method: 'POST',
      url: `${base}${prefix}`,
      body: { name: `cypress-inst-${Math.random().toString(36).substring(2, 6)}` },
      failOnStatusCode: false
    }).then((resp) => {
      expect([401, 403]).to.include(resp.status)
    })
  })

  it('POST /instrument with regular user -> forbidden (admin only)', () => {
    cy.request({
      method: 'POST',
      url: `${base}${prefix}`,
      headers: { 'x-access-token': authToken },
      body: { name: `cypress-inst-${Math.random().toString(36).substring(2, 6)}` },
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.eq(403)
    })
  })
})