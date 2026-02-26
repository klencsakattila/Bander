/// <reference types="cypress" />

describe('Genre routes', () => {
  const base = Cypress.config('baseUrl') || 'http://localhost:3000'
  const prefix = '/genre'

  let genreId: string | null = null

  const extractId = (body: any) =>
    body?.id || body?._id || body?.genre?.id || body?.genre?._id || null

  const adminEmail = Cypress.env('ADMIN_EMAIL')
  const adminPassword = Cypress.env('ADMIN_PASSWORD')
  let adminToken: string | null = null

  it('GET /genre -> returns all genres', () => {
    cy.request({
      method: 'GET',
      url: `${base}${prefix}`,
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.be.within(200, 299)
      expect(Array.isArray(resp.body)).to.eq(true)
      if (resp.body.length > 0) genreId = extractId(resp.body[0])
    })
  })

  it('GET /genre/:id -> returns one genre by id (if any exists)', function () {
    if (!genreId) this.skip()

    cy.request({
      method: 'GET',
      url: `${base}${prefix}/${genreId}`,
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.be.within(200, 299)
      expect(resp.body).to.exist
    })
  })

  it('POST /genre without token -> should be unauthorized/forbidden', () => {
    cy.request({
      method: 'POST',
      url: `${base}${prefix}`,
      body: { name: `genre-${Date.now()}` },
      failOnStatusCode: false
    }).then((resp) => {
      expect([401, 403]).to.include(resp.status)
    })
  })

  it('POST /genre with admin token -> creates genre (if admin creds are set)', function () {
    if (!adminEmail || !adminPassword) this.skip()

    cy.request({
      method: 'POST',
      url: `${base}/users/login`,
      body: { email: adminEmail, password: adminPassword },
      failOnStatusCode: false
    }).then((loginResp) => {
      expect(loginResp.status).to.be.within(200, 299)
      adminToken =
        loginResp.body?.token ||
        loginResp.body?.accessToken ||
        loginResp.body?.data?.token ||
        null
      expect(adminToken).to.exist

      cy.request({
        method: 'POST',
        url: `${base}${prefix}`,
        headers: { Authorization: `Bearer ${adminToken}` },
        body: { name: `genre-${Date.now()}` },
        failOnStatusCode: false
      }).then((createResp) => {
        expect(createResp.status).to.be.within(200, 299)
        const newId = extractId(createResp.body)
        expect(createResp.body).to.exist
        if (newId) genreId = newId
      })
    })
  })
})