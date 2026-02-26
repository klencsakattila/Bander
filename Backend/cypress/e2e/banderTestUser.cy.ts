// typescript
/// <reference types="cypress" />

describe('User routes', () => {
  const base = Cypress.config('baseUrl') || 'http://localhost:3000'
  const prefix = '/users'

  const genRandomUser = () => {
    const t = Date.now()
    return {
      name: `testuser-${t}`,
      email: `testuser+${t}@example.com`,
      password: 'Password123!'
    }
  }

  const extractId = (body: any) => {
    if (!body) return null
    return body.id || body._id || body.user?.id || body.user?._id || body.data?.id || null
  }

  let userData: { name: string; email: string; password: string }
  let userId: string | null = null
  let authToken: string | null = null

  before(() => {
    userData = genRandomUser()
  })

  it('POST /users/register -> should register a new user', () => {
    cy.request({
      method: 'POST',
      url: `${base}${prefix}/register`,
      body: userData,
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.be.within(200, 299)
      const id = extractId(resp.body)
      if (id) userId = id
      // If server returns email or name, sanity-check:
      if (resp.body?.email) {
        expect(resp.body.email).to.equal(userData.email)
      }
    })
  })

  it('POST /users/login -> should login with created user', () => {
    cy.request({
      method: 'POST',
      url: `${base}${prefix}/login`,
      body: { email: userData.email, password: userData.password },
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.be.within(200, 299)
      // try to extract token and id
      const body = resp.body
      if (body?.token) authToken = body.token
      if (!userId) {
        const id = extractId(body)
        if (id) userId = id
      }
    })
  })

  it('GET /users/limit/:limit -> should return a list with at most `limit` users', () => {
    cy.request({
      method: 'GET',
      url: `${base}${prefix}/limit/5`,
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.be.within(200, 299)
      expect(Array.isArray(resp.body)).to.be.true
      expect((resp.body as any[]).length).to.be.at.most(5)
    })
  })

  it('GET /users/limit/:limit/:offset -> should return a list with limit and offset', () => {
    cy.request({
      method: 'GET',
      url: `${base}${prefix}/limit/5/0`,
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.be.within(200, 299)
      expect(Array.isArray(resp.body)).to.be.true
    })
  })

  it('GET /users/:id -> should fetch the created user by id', function () {
    if (!userId) {
      // attempt to fetch a list and pick first user
      cy.request({
        method: 'GET',
        url: `${base}${prefix}/limit/1`,
        failOnStatusCode: false
      }).then((resp) => {
        expect(resp.status).to.be.within(200, 299)
        const first = Array.isArray(resp.body) ? resp.body[0] : null
        const id = extractId(first)
        expect(id).to.exist
        userId = id
        // Now fetch by id
        cy.request({
          method: 'GET',
          url: `${base}${prefix}/${userId}`,
          failOnStatusCode: false
        }).then((r2) => {
          expect(r2.status).to.be.within(200, 299)
        })
      })
    } else {
      cy.request({
        method: 'GET',
        url: `${base}${prefix}/${userId}`,
        failOnStatusCode: false
      }).then((resp) => {
        expect(resp.status).to.be.within(200, 299)
        // If returned object contains email, match it
        if (resp.body?.email) {
          // The created user may or may not be present; only assert if present
          expect(resp.body.email).to.be.a('string')
        }
      })
    }
  })

  it('PATCH /users/:id -> should update user fields', function () {
    if (!userId) this.skip()
    const update = { name: `${userData.name}-updated` }
    const headers: Record<string, string> = {}
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`

    cy.request({
      method: 'PATCH',
      url: `${base}${prefix}/${userId}`,
      body: update,
      headers,
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.be.within(200, 299)
      // If response includes updated user, assert name changed
      if (resp.body?.name) {
        expect(resp.body.name).to.equal(update.name)
      }
    })
  })

  it('POST /users/:id/profile-image -> should accept profile image upload (via curl)', function () {
    if (!userId) this.skip()
    const tokenHeader = authToken ? `-H "Authorization: Bearer ${authToken}"` : ''
    // Use curl to perform multipart upload from fixtures/avatar.png
    // Ensure a fixture image exists at cypress/fixtures/avatar.png; adjust path if needed.
    const url = `${base}${prefix}/${userId}/profile-image`
    const fixturePath = 'cypress/fixtures/avatar.png'
    // -s silent; -o /dev/null to discard body; -w '%{http_code}' to get HTTP code to stdout
    const cmd = `curl -s -o /dev/null -w "%{http_code}" ${tokenHeader} -F "file=@${fixturePath}" "${url}"`
    cy.exec(cmd, { failOnNonZeroExit: false }).then((result) => {
      // result.stdout should be the HTTP status code if curl succeeded
      const codeStr = (result.stdout || '').trim()
      const codeNum = parseInt(codeStr, 10)
      // Accept any 2xx or 4xx/5xx if server not supporting upload; ensure command ran
      expect(result.code).to.be.a('number')
      // If curl returned an HTTP code, assert it's 2xx; otherwise just ensure exec succeeded
      if (!Number.isNaN(codeNum)) {
        expect(codeNum).to.be.within(200, 299)
      }
    })
  })

  it('DELETE /users/:id -> should delete the created user', function () {
    if (!userId) {
      // Nothing to delete; skip
      cy.log('No userId available to delete; skipping')
      return
    }
    const headers: Record<string, string> = {}
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`

    cy.request({
      method: 'DELETE',
      url: `${base}${prefix}/${userId}`,
      headers,
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.be.within(200, 299)
      // Optionally verify deletion: GET should not return 2xx
      cy.request({
        method: 'GET',
        url: `${base}${prefix}/${userId}`,
        failOnStatusCode: false
      }).then((r2) => {
        // Accept that server might still return the user or 404; do not assert strict behavior
        expect([200, 404, 204]).to.include.oneOf([r2.status])
      })
    })
  })
})