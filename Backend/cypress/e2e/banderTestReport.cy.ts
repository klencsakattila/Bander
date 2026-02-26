/// <reference types="cypress" />

describe('Report routes', () => {
  const base = Cypress.config('baseUrl') || 'http://localhost:3000'
  const prefix = '/report'

  // Required for create tests:
  // PowerShell:
  // $env:CYPRESS_REPORTER_ID=1
  // $env:CYPRESS_REPORTED_USER_ID=2   (or set BAND/POST instead)
  const reporterId = Number(Cypress.env('REPORTER_ID'))
  const reportedUserId = Cypress.env('REPORTED_USER_ID') ? Number(Cypress.env('REPORTED_USER_ID')) : null
  const reportedBandId = Cypress.env('REPORTED_BAND_ID') ? Number(Cypress.env('REPORTED_BAND_ID')) : null
  const reportedPostId = Cypress.env('REPORTED_POST_ID') ? Number(Cypress.env('REPORTED_POST_ID')) : null

  let reportId: number | null = null

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

  it('GET /report/:id -> returns report when id exists', function () {
    if (!reportId) this.skip()

    cy.request({
      method: 'GET',
      url: `${base}${prefix}/${reportId}`,
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.eq(200)
      expect(resp.body).to.have.property('id', reportId)
    })
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

  it('POST /report -> creates report with valid payload', function () {
    if (!reporterId || Number.isNaN(reporterId)) this.skip()
    if (!reportedUserId && !reportedBandId && !reportedPostId) this.skip()

    cy.request({
      method: 'POST',
      url: `${base}${prefix}`,
      body: {
        reporter_id: reporterId,
        reported_user_id: reportedUserId,
        reported_band_id: reportedBandId,
        reported_post_id: reportedPostId,
        report_message: `Cypress report ${Date.now()}`
      },
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.eq(201)
      expect(resp.body).to.have.property('id')
      expect(resp.body).to.have.property('reporter_id', reporterId)
      expect(resp.body).to.have.property('report_status')
      reportId = resp.body.id
    })
  })

  it('PATCH/PUT /report/:id/status -> 400 on invalid status', function () {
    if (!reportId) this.skip()

    cy.request({
      method: 'PATCH',
      url: `${base}${prefix}/${reportId}/status`,
      body: { report_status: 'invalid_status' },
      failOnStatusCode: false
    }).then((resp) => {
      // if route is PUT only, PATCH may return 404/405
      if ([404, 405].includes(resp.status)) {
        cy.request({
          method: 'PUT',
          url: `${base}${prefix}/${reportId}/status`,
          body: { report_status: 'invalid_status' },
          failOnStatusCode: false
        }).then((resp2) => {
          expect(resp2.status).to.eq(400)
        })
      } else {
        expect(resp.status).to.eq(400)
      }
    })
  })

  it('PATCH/PUT /report/:id/status -> updates status to reviewing', function () {
    if (!reportId) this.skip()

    const body = { report_status: 'reviewing' }

    cy.request({
      method: 'PATCH',
      url: `${base}${prefix}/${reportId}/status`,
      body,
      failOnStatusCode: false
    }).then((resp) => {
      if ([404, 405].includes(resp.status)) {
        cy.request({
          method: 'PUT',
          url: `${base}${prefix}/${reportId}/status`,
          body,
          failOnStatusCode: false
        }).then((resp2) => {
          expect(resp2.status).to.eq(200)
          expect(resp2.body).to.have.property('report_status', 'reviewing')
        })
      } else {
        expect(resp.status).to.eq(200)
        expect(resp.body).to.have.property('report_status', 'reviewing')
      }
    })
  })

  it('DELETE /report/:id -> 400 on invalid id', () => {
    cy.request({
      method: 'DELETE',
      url: `${base}${prefix}/abc`,
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.eq(400)
    })
  })

  it('DELETE /report/:id -> deletes created report', function () {
    if (!reportId) this.skip()

    cy.request({
      method: 'DELETE',
      url: `${base}${prefix}/${reportId}`,
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.eq(200)
      expect(resp.body).to.have.property('message')
    })
  })
})