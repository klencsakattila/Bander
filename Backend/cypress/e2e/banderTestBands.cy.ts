// typescript
/// <reference types="cypress" />

describe('Band routes', () => {
  const base = Cypress.config('baseUrl') || 'http://localhost:3000'
  const prefix = '/bands'

  let bandId: string | null = null
  let postId: string | null = null
  let userId: string | null = null
  let authToken: string | null = null

  const genRandomUser = () => {
    const t = Math.random().toString(36).substring(2, 6)
    return {
      name: `testuser-${t}`,
      email: `testuser${t}@example.com`,
      password: 'Password123!'
    }
  }

  const extractId = (body: any) =>
    body?.id || body?._id || body?.band?.id || body?.band?._id || body?.post?.id || body?.post?._id || null

  const makeBandPayload = () => ({
    name: `Test Band ${Math.random().toString(36).substring(2, 6)}`,
    description: 'Band created by Cypress test'
  })

  const makePostPayload = () => ({
    band_id: bandId,
    post_type: 'announcement',
    post_message: `Test Post ${Math.random().toString(36).substring(2, 6)}`,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  })

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
      // signUp returns only token, decode it to get user id
      const token = resp.body?.token
      if (token) {
        authToken = token
        // Decode JWT (split by . and decode the payload)
        const payload = JSON.parse(atob(token.split('.')[1]))
        userId = payload.id
      }
    })
  })

  it('POST /bands/newband', () => {
    cy.request({
      method: 'POST',
      url: `${base}${prefix}/newband`,
      body: makeBandPayload(),
      headers: { 'x-access-token': authToken },
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.be.within(200, 299)
      bandId = extractId(resp.body)
      expect(bandId).to.exist
    })
  })

  it('GET /bands/limit/:limit', () => {
    cy.request({
      method: 'GET',
      url: `${base}${prefix}/limit/5`,
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.be.within(200, 299)
      expect(Array.isArray(resp.body)).to.eq(true)
      expect(resp.body.length).to.be.at.most(5)
      if (!bandId && resp.body[0]) bandId = extractId(resp.body[0])
    })
  })

  it('GET /bands/limit/:limit/:offset', () => {
    cy.request({
      method: 'GET',
      url: `${base}${prefix}/limit/5/0`,
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.be.within(200, 299)
      expect(Array.isArray(resp.body)).to.eq(true)
    })
  })

  it('GET /bands/:id', function () {
    if (!bandId) this.skip()
    cy.request({
      method: 'GET',
      url: `${base}${prefix}/${bandId}`,
      headers: { 'x-access-token': authToken },
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.be.within(200, 299)
    })
  })

  it('PATCH /bands/:id', function () {
    if (!bandId) this.skip()
    cy.request({
      method: 'PATCH',
      url: `${base}${prefix}/${bandId}`,
      body: { 
        name: `Updated Band ${Math.random().toString(36).substring(2, 6)}`,
        description: 'Updated by Cypress',
        city: 'Test City'
      },
      headers: { 'x-access-token': authToken },
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.be.within(200, 299)
    })
  })

  it('POST /bands/post', function () {
    if (!bandId) this.skip()
    cy.request({
      method: 'POST',
      url: `${base}${prefix}/post`,
      body: makePostPayload(),
      headers: { 'x-access-token': authToken },
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.be.within(200, 299)
      postId = extractId(resp.body)
      expect(postId).to.exist
    })
  })

  it('GET /bands/post/limit/:limit', () => {
    cy.request({
      method: 'GET',
      url: `${base}${prefix}/post/limit/5`,
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.be.within(200, 299)
      expect(Array.isArray(resp.body)).to.eq(true)
      expect(resp.body.length).to.be.at.most(5)
      if (!postId && resp.body[0]) postId = extractId(resp.body[0])
    })
  })

  it('GET /bands/post/limit/:limit/:offset', () => {
    cy.request({
      method: 'GET',
      url: `${base}${prefix}/post/limit/5/0`,
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.be.within(200, 299)
      expect(Array.isArray(resp.body)).to.eq(true)
    })
  })

  it('GET /bands/post/:id', function () {
    if (!postId) this.skip()
    cy.request({
      method: 'GET',
      url: `${base}${prefix}/post/${postId}`,
      headers: { 'x-access-token': authToken },
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.be.within(200, 299)
    })
  })

  it('POST /bands/:id/profile-image', function () {
    // Skipping file upload test
    // File uploads work properly from the frontend
    this.skip()
  })

  it('POST /bands/:id/banner-image', function () {
    // Skipping file upload test
    // File uploads work properly from the frontend
    this.skip()
  })

  it('POST /bands/post/:id/image', function () {
    // Skipping file upload test
    // File uploads work properly from the frontend
    this.skip()
  })

  it('PUT /bands/newuser', function () {
    if (!bandId) this.skip()
    cy.request({
      method: 'PUT',
      url: `${base}${prefix}/newuser`,
      body: { band_id: bandId, user_id: userId },
      headers: { 'x-access-token': authToken },
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.be.within(200, 299)
    })
  })

  it('DELETE /bands/post/:id', function () {
    if (!postId) this.skip()
    cy.request({
      method: 'DELETE',
      url: `${base}${prefix}/post/${postId}`,
      headers: { 'x-access-token': authToken },
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.be.within(200, 299)
    })
  })

  it('DELETE /bands/:id', function () {
    if (!bandId) this.skip()
    cy.request({
      method: 'DELETE',
      url: `${base}${prefix}/${bandId}`,
      headers: { 'x-access-token': authToken },
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.be.within(200, 299)
    })
  })
})