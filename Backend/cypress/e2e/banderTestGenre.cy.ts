/// <reference types="cypress" />

describe('Genre routes', () => {
  const base = Cypress.config('baseUrl') || 'http://localhost:3000'
  const prefix = '/genres'

  let genreId: string | null = null
  let authToken: string | null = null

  const extractId = (body: any) =>
    body?.id || body?._id || body?.genre?.id || body?.genre?._id || null

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

  it('GET /genres -> returns all genres', () => {
    cy.request({
      method: 'GET',
      url: `${base}${prefix}`,
      headers: { 'x-access-token': authToken },
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.be.within(200, 299)
      expect(Array.isArray(resp.body)).to.eq(true)
      if (resp.body.length > 0) genreId = extractId(resp.body[0])
    })
  })

  it('GET /genres/:id -> returns one genre by id (if any exists)', function () {
    if (!genreId) this.skip()

    cy.request({
      method: 'GET',
      url: `${base}${prefix}/${genreId}`,
      headers: { 'x-access-token': authToken },
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.be.within(200, 299)
      expect(resp.body).to.exist
    })
  })

  it('POST /genres without token -> should be unauthorized/forbidden', () => {
    cy.request({
      method: 'POST',
      url: `${base}${prefix}`,
      body: { name: `genre-${Math.random().toString(36).substring(2, 6)}` },
      failOnStatusCode: false
    }).then((resp) => {
      expect([401, 403]).to.include(resp.status)
    })
  })

  it('POST /genres with regular user -> should be forbidden (admin only)', () => {
    cy.request({
      method: 'POST',
      url: `${base}${prefix}`,
      headers: { 'x-access-token': authToken },
      body: { name: `genre-${Math.random().toString(36).substring(2, 6)}` },
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.equal(403)
    })
  })
})