/// <reference types="cypress" />

describe('Instrument routes', () => {
  const base = Cypress.config('baseUrl') || 'http://localhost:3000'
  const prefix = '/instrument'

  const adminEmail = Cypress.env('ADMIN_EMAIL')
  const adminPassword = Cypress.env('ADMIN_PASSWORD')

  let instrumentId: number | null = null
  let adminToken: string | null = null

  const extractId = (body: any): number | null =>
    body?.id ?? body?._id ?? body?.instrument?.id ?? null

  it('GET /instrument -> returns all instruments', () => {
    cy.request({
      method: 'GET',
      url: `${base}${prefix}`,
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
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.eq(400)
    })
  })

  it('POST /instrument without token -> unauthorized/forbidden', () => {
    cy.request({
      method: 'POST',
      url: `${base}${prefix}`,
      body: { name: `cypress-inst-${Date.now()}` },
      failOnStatusCode: false
    }).then((resp) => {
      expect([401, 403]).to.include(resp.status)
    })
  })

  it('POST /instrument with admin token -> creates instrument (if admin creds set)', function () {
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

      const name = `cypress-inst-${Date.now()}`

      cy.request({
        method: 'POST',
        url: `${base}${prefix}`,
        headers: { Authorization: `Bearer ${adminToken}` },
        body: { name },
        failOnStatusCode: false
      }).then((createResp) => {
        expect(createResp.status).to.eq(201)
        expect(createResp.body).to.have.property('id')
        expect(createResp.body).to.have.property('name', name)
        instrumentId = createResp.body.id
      })
    })
  })

  it('POST /instrument duplicate name -> 409 (if admin creds set)', function () {
    if (!adminEmail || !adminPassword) this.skip()

    const dupName = `cypress-dup-inst-${Date.now()}`

    cy.request({
      method: 'POST',
      url: `${base}/users/login`,
      body: { email: adminEmail, password: adminPassword },
      failOnStatusCode: false
    }).then((loginResp) => {
      const token =
        loginResp.body?.token ||
        loginResp.body?.accessToken ||
        loginResp.body?.data?.token

      expect(token).to.exist

      cy.request({
        method: 'POST',
        url: `${base}${prefix}`,
        headers: { Authorization: `Bearer ${token}` },
        body: { name: dupName },
        failOnStatusCode: false
      }).then((r1) => {
        expect([201, 409]).to.include(r1.status)

        cy.request({
          method: 'POST',
          url: `${base}${prefix}`,
          headers: { Authorization: `Bearer ${token}` },
          body: { name: dupName },
          failOnStatusCode: false
        }).then((r2) => {
          expect(r2.status).to.eq(409)
        })
      })
    })
  })
})