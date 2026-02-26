/// <reference types="cypress" />

describe('Message routes', () => {
  const base = Cypress.config('baseUrl') || 'http://localhost:3000'
  const prefix = '/message'

  // Provide existing IDs via env for stable create test:
  // CYPRESS_THREAD_ID=1 CYPRESS_SENDER_ID=2 npx cypress run --spec cypress/e2e/message.routes.cy.ts
  const threadId = Number(Cypress.env('THREAD_ID'))
  const senderId = Number(Cypress.env('SENDER_ID'))

  let createdMessageId: number | null = null

  it('POST /message -> 400 when required fields are missing', () => {
    cy.request({
      method: 'POST',
      url: `${base}${prefix}`,
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
      body: { thread_id: 'abc', sender_id: 'xyz', message: 'hello' },
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.eq(400)
    })
  })

  it('POST /message -> creates message when valid thread/user membership is provided', function () {
    if (!threadId || !senderId || Number.isNaN(threadId) || Number.isNaN(senderId)) this.skip()

    cy.request({
      method: 'POST',
      url: `${base}${prefix}`,
      body: {
        thread_id: threadId,
        sender_id: senderId,
        message: `Cypress message ${Date.now()}`
      },
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.eq(201)
      expect(resp.body).to.have.property('id')
      expect(resp.body).to.have.property('thread_id', threadId)
      expect(resp.body).to.have.property('sender_id', senderId)
      expect(resp.body).to.have.property('message')
      createdMessageId = resp.body.id
    })
  })

  it('DELETE /message/:id -> 400 for invalid id', () => {
    cy.request({
      method: 'DELETE',
      url: `${base}${prefix}/abc`,
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.eq(400)
    })
  })

  it('DELETE /message/:id -> deletes created message', function () {
    if (!createdMessageId) this.skip()

    cy.request({
      method: 'DELETE',
      url: `${base}${prefix}/${createdMessageId}`,
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.eq(200)
      expect(resp.body).to.have.property('message')
    })
  })

  it('DELETE /message/:id -> 404 when message does not exist', () => {
    cy.request({
      method: 'DELETE',
      url: `${base}${prefix}/999999999`,
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.eq(404)
    })
  })
})