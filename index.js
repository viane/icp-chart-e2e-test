/* global it, describe, before, beforeEach, after, afterEach */
require('dotenv').config()
require('mocha-generators').install()

const Nightmare = require('nightmare')
const chai = require('chai')
const assert = require('assert')
const expect = chai.expect


const ICP_URL = process.env.ICP_URL

if(!ICP_URL) throw Error(`No ICP host url specified in env var`)

const nightmare = new Nightmare({ 
  show: true,
  switches: {
  'ignore-certificate-errors': true // Bypass self signed ssl certificate
  },
  webPreferences: {
    partition: 'persist:nightmare'
  }
})

describe('test duckduckgo search results', () => {

  // it('should find the nightmare github link first', function(done) {
  //   this.timeout('10s')

  //   nightmare
  //     .goto('https://duckduckgo.com')
  //     .type('#search_form_input_homepage', 'github nightmare')
  //     .click('#search_button_homepage')
  //     .wait('#links .result__a')
  //     .evaluate(() => document.querySelector('#links .result__a').href)
  //     .end()
  //     .then(link => {
  //       expect(link).to.equal('https://github.com/segmentio/nightmare')
  //       done()
  //     })
  //     .catch(e=>{
  //       done(e)
  //     })
  // })

  it('Check ICP login status', function(done) {
    this.timeout('30s')

    nightmare
      .goto(`${ICP_URL}/oidc/login.jsp`)
      .type('#username', 'admin')
      .type('#password', 'admin')
      .click('button')
      .wait('#page .welcome--text')
      .goto(`${ICP_URL}/catalog`)
      .wait('#search-1')
      .type('#search-1', 'broker')
      .evaluate(() => document.URL)
      .end()
      .then(loginRedirctURL => {
        expect(loginRedirctURL).to.equal(`${ICP_URL}/catalog/`)
        done()
      })
      .catch(e=>{
        done(e)
      })
  })
})