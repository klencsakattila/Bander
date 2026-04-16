/// <reference types="cypress" />

describe('Report routes', () => {
  const base = Cypress.config('baseUrl') || 'http://localhost:3000'
  const prefix = '/reports'

  let reportId: number | null = null
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

  it('GET /report -> returns all reports', () => {
    cy.request({
      method: 'GET',
      url: `${base}${prefix}`,
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.eq(200)
      expect(Array.isArray(resp.body)).to.eq(true)
      if (resp.body.length > 0) reportId = resp.body[0]?.id ?? null
    })
  })

  it('GET /report/:id -> 400 on invalid id', () => {
    cy.request({
      method: 'GET',
      url: `${base}${prefix}/abc`,
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.eq(400)
    })
  })

  it('GET /report/:id -> returns report when id exists or 404 when not found', function () {
    if (reportId) {
      // Test existing report
      cy.request({
        method: 'GET',
        url: `${base}${prefix}/${reportId}`,
        failOnStatusCode: false
      }).then((resp) => {
        expect(resp.status).to.eq(200)
        expect(resp.body).to.have.property('id', reportId)
      })
    } else {
      // Test non-existent report
      cy.request({
        method: 'GET',
        url: `${base}${prefix}/99999`,
        failOnStatusCode: false
      }).then((resp) => {
        expect(resp.status).to.eq(404)
      })
    }
  })

  it('POST /report -> 400 when required fields missing', () => {
    cy.request({
      method: 'POST',
      url: `${base}${prefix}`,
      body: {},
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.eq(400)
    })
  })

  it('POST /report -> 400 when no target is specified', () => {
    cy.request({
      method: 'POST',
      url: `${base}${prefix}`,
      body: { reporter_id: 1, report_message: 'Test report' },
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.eq(400)
    })
  })

  it('POST /report -> 400 for invalid reporter_id', () => {
    cy.request({
      method: 'POST',
      url: `${base}${prefix}`,
      body: {
        reporter_id: 'abc',
        reported_user_id: 1,
        report_message: 'Test report'
      },
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.eq(400)
    })
  })

  it('DELETE /report/:id without admin token -> forbidden', () => {
    cy.request({
      method: 'DELETE',
      url: `${base}${prefix}/1`,
      failOnStatusCode: false
    }).then((resp) => {
      expect([401, 403]).to.include(resp.status)
    })
  })

  it('PATCH /report/:id without admin token -> forbidden', () => {
    cy.request({
      method: 'PATCH',
      url: `${base}${prefix}/1`,
      body: { report_status: 'resolved' },
      failOnStatusCode: false
    }).then((resp) => {
      expect([401, 403]).to.include(resp.status)
    })
  })

  it('PATCH /report/:id with regular user -> forbidden', () => {
    cy.request({
      method: 'PATCH',
      url: `${base}${prefix}/1`,
      headers: { 'x-access-token': authToken },
      body: { report_status: 'resolved' },
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.eq(403)
    })
  })
})