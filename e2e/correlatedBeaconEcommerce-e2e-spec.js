var requestPage = require("../index.js").requestPage,
  request = require('request'),
  sendBrowserBeacon = require("../index.js").sendBrowserBeacon,
  alterStandardBrowserBeacon = require("../index.js").alterStandardBrowserBeacon,
  correlationHeaders = require("../index.js").correlationHeaders,
  createBrowserGUID = require("../index.js").createBrowserGUID,
  updateCorrelationInBeacon = require("../index.js").updateCorrelationInBrowserBeacon,
  origBeacon = require("./assets/ecommerceBeacon.json");

/**********************************************************************************************
* These tests use ECommerce application from https://github.com/appddemo/ECommerce and
* POST the beacon to a live collector
*
* Change CONSTANTS below in order to run the test.
***********************************************************************************************/

const ECOMMERCE_URL = "http://localhost";
const EUM_COLLECTOR = "col.eum-appdynamics.com";
const BRUM_KEY = "AD-AAB-AAC-KEX";

/**
* These tests use the header, 'appdynamicssnapshotenabled' : 'true', to try and
* force a snapshot on the server side. There is no garauntee it will work everytime,
* however, experience has shown that most browser snapshots should have correlation.
*
* A "generic" beacon is used, and will not match up with the actual html page from ecommerce.
*
*/
describe("Request page as browser for Ecommerce app and send beacon", function() {

  beforeEach(function() {
    this.beacon = JSON.parse(JSON.stringify(origBeacon));
  });

  it("should fetch categroy page with force snapshot header and send beacon with correlation info", function(done) {

    var defaultBeacon = this.beacon;

    requestPage('get', ECOMMERCE_URL + '/appdynamicspilot/index.xhtml?t=Book&c=Fiction', request.jar(), {'appdynamicssnapshotenabled' : 'true'}, null, 2000).then(function(result) {
      expect(result.headers).toBeDefined();
      expect(result.body).toBeDefined();
      expect(result.headers.adrum_0).toBeDefined();

      var beacon = alterStandardBrowserBeacon(defaultBeacon, createBrowserGUID(), {c : 'Spain', r : 'Madrid', t : 'Madrid' });
      updateCorrelationInBeacon(beacon, correlationHeaders(result.headers));

      sendBrowserBeacon(beacon, "Mozilla/5.0 (Windows; U; MSIE 9.0; WIndows NT 9.0; en-US))", EUM_COLLECTOR, BRUM_KEY).then(function(result) {
          expect(result.statusCode).toBe(200);
          done();
      });
    });
  });

});
