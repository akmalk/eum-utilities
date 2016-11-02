var requestPage = require("../index.js").requestPage,
  request = require('request'),
  sendBrowserBeacon = require("../index.js").sendBrowserBeacon,
  alterStandardBrowserBeacon = require("../index.js").alterStandardBrowserBeacon,
  correlationHeaders = require("../index.js").correlationHeaders,
  createBrowserGUID = require("../index.js").createBrowserGUID,
  updateCorrelationInBeacon = require("../index.js").updateCorrelationInBrowserBeacon,
  origBeacon = require("./assets/ecommerceBeacon.json"),
  jsdom = require("jsdom");

  /**********************************************************************************************
  * These tests uses new ECommerce application from https://github.com/appddemo/ECommerce and
  * POSTs the beacon to a live collector. It validates you can successfully log into the
  * ECommerce application
  *
  * Change CONSTANTS below in order to run the test.
  ***********************************************************************************************/

  const ECOMMERCE_URL = "http://localhost";
  const EUM_COLLECTOR = "col.eum-appdynamics.com";
  const BRUM_KEY = "AD-AAB-AAC-KEX";

describe("Log in to Ecommerce", function() {

  it("should log into Ecommerce and see books on screen", function(done) {

    var jar = request.jar();

    requestPage('get', ECOMMERCE_URL + '/appdynamicspilot/login.xhtml', jar, null, null, 2000).then(function(result) {
      jsdom.env(result.body, function(err, window) {

        var csfrToken = window.document.getElementById("j_id1:javax.faces.ViewState:1").value;
        expect(csfrToken).toBeDefined();
        expect(csfrToken.length).toBeGreaterThan(10);
        var form = {
          "login" : "login",
          "login:username" : "aleftik@appdynamics.com",
          "login:password" : "aleftik",
          "login:loginButton" : null,
          "javax.faces.ViewState" : csfrToken
        }
        requestPage('post', ECOMMERCE_URL + '/appdynamicspilot/login.xhtml', jar, null, form, 20000).then(function(result) {
          expect(result.body.match(/Top Seller/).length).toBe(1);
          done();
        }).catch(function(reason) {
          throw new Error("fail");
          console.log(reason);
          done();
        });

      });

    });
  }, 20000);

});
