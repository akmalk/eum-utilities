var requestPage = require("../index.js").requestPage,
  request = require('request');

/**********************************************************************************************
* These tests use ECommerce application from https://github.com/appddemo/ECommerce
* to validate requesting pages from the app (most of the pages require logging in to the app).
* Change ECOMMERCE_URL to your local version of ECommerce.
***********************************************************************************************/

const ECOMMERCE_URL = "http://dev-ecommerce.demo.appdynamics.com";

describe("Request page as browser for Ecommerce app", function() {

  it("should be able to fetch the home page", function(done) {

    requestPage('get', ECOMMERCE_URL + '/appdynamicspilot/', request.jar(), {}, null, 2000).then(function(result) {
      expect(result.headers).toBeDefined();
      expect(result.body).toBeDefined();
      done();
    });
  });


  it("should force java agent to return correlation headers", function() {
    requestPage('get', ECOMMERCE_URL + '/appdynamicspilot/', request.jar(), {}, null, 2000).then(function(result) {
      expect(result.headers['adrum_0']).toBeDefined();
      done();
    });
  });

  it("should be able to log into the app", function(done) {

    requestPage('post', ECOMMERCE_URL + '/appdynamicspilot/UserLogin.action', request.jar(), {}, {loginName : 'aleftik', password : 'aleftik'}, 2000).then(function(result) {
      expect(result.statusCode).toBe(302);
      done();
    });
  });

});

describe("Request page as mobile app for Ecommerce", function() {

  it("should be able to login and fetch items", function(done) {

    var jar = request.jar();
    requestPage('post', ECOMMERCE_URL + '/appdynamicspilot/rest/user', jar, {}, {loginName : 'aleftik', password : 'aleftik'}, 2000).then(function(result) {
      //TODO - com.appdynamicspilot.restv2.Carts -> refactor that to not check for USERNAME header, would make life easier in load script...
      var headers = {
        'USERNAME' : 'aleftik',
      }
      requestPage('get', 'http://dev-ecommerce.demo.appdynamics.com/appdynamicspilot/rest/cart/1', jar, headers, {}, 2000).then(function(result) {
        expect(result.headers['cart-size']).toBeDefined();
        expect(result.statusCode).toBe(204);
        done();
      });
    })
  }, 20000);
});
