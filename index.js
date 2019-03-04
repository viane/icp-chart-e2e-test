/* global it, describe, before, beforeEach, after, afterEach */
require('dotenv').config()
require('mocha-generators').install()

const Nightmare = require('nightmare')
const chai = require('chai')
const assert = require('assert')
const expect = chai.expect


const ICP_URL = process.env.ICP_URL
const USERNAME = process.env.USERNAME
const PASSWORD = process.env.PASSWORD
const CHART_VERSION = process.env.CHART_VERSION
const RELEASE_NAME = process.env.RELEASE_NAME
const TARGET_NAMESPACE = process.env.TARGET_NAMESPACE
const ZOSMF_HOST = process.env.ZOSMF_HOST
const ZOSMF_DOMAIN = process.env.ZOSMF_DOMAIN
const PVC = process.env.PVC

if(!ICP_URL || !USERNAME || !PASSWORD || !CHART_VERSION ) throw Error(`No env var specified`)

const nightmare = new Nightmare({
  show: true,
  switches: {
  'ignore-certificate-errors': true // Bypass self signed ssl certificate
  },
  // webPreferences: {
  //   partition: 'persist:nightmare'
  // },
  waitTimeout: 60000,
  loadTimeout: 60000,
  executionTimeout: 20000,
  width: 1600,
  height: 900,
  pollInterval: 1000,
  dock: true,
  openDevTools: {
    mode: 'detach'
  }
})

const serarch_chart_in_catalog = () => {
        return nightmare
              // search ibm-zos-cloud-broker
        .wait('#search-1', 5000)
        .type('#search-1', 'ibm-zos-cloud-broker')
        // wait broker tile show up
            .wait('#resourceLink_ibm-zos-cloud-broker', 1000)
          .click('#resourceLink_ibm-zos-cloud-broker')
}

const check_specific_version_chart = () => {
        return nightmare
          .evaluate(() => document.URL)
          .then(loginRedirctURL => {
            expect(loginRedirctURL).to.equal(`${ICP_URL}/catalog/catalogdetails/local-charts/ibm-zos-cloud-broker/${CHART_VERSION}`)
          })
}

const open_chart_install_config_pane = ()=>{
        return nightmare
        .wait('#CatalogDetails #configureButton', 5000)
        .click('#configureButton')
}

const fill_release_installation_information = ()=>{
        return nightmare
        .type('#selectedReleaseName',RELEASE_NAME)
        .select('#selectedNamespace',TARGET_NAMESPACE)
        .click('#license')
        .type('#zosmf\\.host', ZOSMF_HOST)
        .type('#zosmf\\.domain', ZOSMF_DOMAIN)
        .type('#couchdb\\.databasePVC\\.existingClaimName', PVC)
        .click('#catalogservicedetailbutton')
}

const verify_release_status_pop_up = ()=>{
          return nightmare
        .wait('#DeploymentSuccessfulModal', 30000) //wait 30 seconds
        .evaluate(() => document.querySelector('.deploymentModal').textContent)
        .then(successText => {
          expect(successText).to.equal('Installation started. For progress view your Helm release.')
        })
}

const verify_release_information = () =>{
        return nightmare
        .click('.deploymentModalButton button')
        .wait(10000)
        .wait('.detail-main-content__container', 30000)
        .evaluate(() => document.querySelector('#StatusText').textContent)
        .then(successText => {
          expect(successText).to.equal('Deployed')
        })
}

describe('test deploy pev065 broker', () => {

  // it('should find the nightmare github link first', function(done) {
  //   this.timeout('60s')

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
    this.timeout('60s')

    nightmare
    // login
      .goto(`${ICP_URL}/oidc/login.jsp`)
      .type('#username', USERNAME)
      .type('#password', PASSWORD)
      .click('button')
      // wait for welcome page
      .wait('#page .welcome', 5000)
      // go to catalog page
      .goto(`${ICP_URL}/catalog`)
      .evaluate(() => document.URL)
      .then(loginRedirctURL => {
        expect(loginRedirctURL).to.equal(`${ICP_URL}/catalog/`)
      })
      .then(function() {
        return serarch_chart_in_catalog()
      })
      .then(function() {
        return check_specific_version_chart()
      })
      .then(function() {
        return open_chart_install_config_pane()
      })
      .then(function() {
        return fill_release_installation_information()
      })
      .then(function() {
      return verify_release_status_pop_up()
      })
      .then(()=>{
      return verify_release_information()
      })
      // End test
      .then(()=>{
        return nightmare
        .end()
        .then(()=>{
          done()
        })
      })
      .catch(e=>{
              done(e)
            })

  })
})
