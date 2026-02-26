// typescript
/// <reference types="cypress" />

describe('Band routes', () => {
  const base = Cypress.config('baseUrl') || 'http://localhost:3000'
  const prefix = '/band'

  let bandId: string | null = null
  let postId: string | null = null
  let userId: string | null = null

  const extractId = (body: any) =>
    body?.id || body?._id || body?.band?.id || body?.band?._id || body?.post?.id || body?.post?._id || null

  const makeBandPayload = () => ({
    name: `Test Band ${Date.now()}`,
    description: 'Band created by Cypress test'
  })

  const makePostPayload = () => ({
    title: `Test Post ${Date.now()}`,
    content: 'Post created by Cypress test',
    bandId
  })

  it('POST /band/newband', () => {
    cy.request({
      method: 'POST',
      url: `${base}${prefix}/newband`,
      body: makeBandPayload(),
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.be.within(200, 299)
      bandId = extractId(resp.body)
      expect(bandId).to.exist
    })
  })

  it('GET /band/limit/:limit', () => {
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

  it('GET /band/limit/:limit/:offset', () => {
    cy.request({
      method: 'GET',
      url: `${base}${prefix}/limit/5/0`,
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.be.within(200, 299)
      expect(Array.isArray(resp.body)).to.eq(true)
    })
  })

  it('GET /band/:id', function () {
    if (!bandId) this.skip()
    cy.request({
      method: 'GET',
      url: `${base}${prefix}/${bandId}`,
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.be.within(200, 299)
    })
  })

  it('PATCH /band/:id', function () {
    if (!bandId) this.skip()
    cy.request({
      method: 'PATCH',
      url: `${base}${prefix}/${bandId}`,
      body: { description: 'Updated by Cypress' },
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.be.within(200, 299)
    })
  })

  it('POST /band/post', function () {
    if (!bandId) this.skip()
    cy.request({
      method: 'POST',
      url: `${base}${prefix}/post`,
      body: makePostPayload(),
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.be.within(200, 299)
      postId = extractId(resp.body)
      expect(postId).to.exist
    })
  })

  it('GET /band/post/limit/:limit', () => {
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

  it('GET /band/post/limit/:limit/:offset', () => {
    cy.request({
      method: 'GET',
      url: `${base}${prefix}/post/limit/5/0`,
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.be.within(200, 299)
      expect(Array.isArray(resp.body)).to.eq(true)
    })
  })

  it('GET /band/post/:id', function () {
    if (!postId) this.skip()
    cy.request({
      method: 'GET',
      url: `${base}${prefix}/post/${postId}`,
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.be.within(200, 299)
    })
  })

  it('POST /band/:id/profile-image', function () {
    if (!bandId) this.skip()
    cy.visit('about:blank')
    cy.document().then((doc) => {
      const form = doc.createElement('form')
      form.action = `${base}${prefix}/${bandId}/profile-image`
      form.method = 'POST'
      form.enctype = 'multipart/form-data'
      const input = doc.createElement('input')
      input.type = 'file'
      input.name = 'file'
      input.id = 'fileInput'
      form.appendChild(input)
      doc.body.appendChild(form)
    })
    cy.get('#fileInput').selectFile('cypress/fixtures/avatar.png', { force: true })
    cy.get('form').submit()
  })

  it('POST /band/:id/banner-image', function () {
    if (!bandId) this.skip()
    cy.visit('about:blank')
    cy.document().then((doc) => {
      const form = doc.createElement('form')
      form.action = `${base}${prefix}/${bandId}/banner-image`
      form.method = 'POST'
      form.enctype = 'multipart/form-data'
      const input = doc.createElement('input')
      input.type = 'file'
      input.name = 'file'
      input.id = 'fileInput2'
      form.appendChild(input)
      doc.body.appendChild(form)
    })
    cy.get('#fileInput2').selectFile('cypress/fixtures/avatar.png', { force: true })
    cy.get('form').submit()
  })

  it('POST /band/post/:id/image', function () {
    if (!postId) this.skip()
    cy.visit('about:blank')
    cy.document().then((doc) => {
      const form = doc.createElement('form')
      form.action = `${base}${prefix}/post/${postId}/image`
      form.method = 'POST'
      form.enctype = 'multipart/form-data'
      const input = doc.createElement('input')
      input.type = 'file'
      input.name = 'file'
      input.id = 'fileInput3'
      form.appendChild(input)
      doc.body.appendChild(form)
    })
    cy.get('#fileInput3').selectFile('cypress/fixtures/avatar.png', { force: true })
    cy.get('form').submit()
  })

  it('PUT /band/newuser', function () {
    if (!bandId) this.skip()
    cy.request({
      method: 'PUT',
      url: `${base}${prefix}/newuser`,
      body: { bandId, userId },
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.be.within(200, 299)
    })
  })

  it('DELETE /band/post/:id', function () {
    if (!postId) this.skip()
    cy.request({
      method: 'DELETE',
      url: `${base}${prefix}/post/${postId}`,
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.be.within(200, 299)
    })
  })

  it('DELETE /band/:id', function () {
    if (!bandId) this.skip()
    cy.request({
      method: 'DELETE',
      url: `${base}${prefix}/${bandId}`,
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.be.within(200, 299)
    })
  })
})