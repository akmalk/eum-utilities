var nock = require('nock'),
  sendMobileBeacon = require("../index.js").sendMobileBeacon,
  sendDelayedMobileBeacon = require("../index.js").sendDelayedMobileBeacon,
  sendBrowserBeacon = require("../index.js").sendBrowserBeacon;


describe("send mobile beacon", function() {

  //TODO - couldn't get headers to match with nock
  it("makes post request with url and returns body and statusCode in promise", function(done) {

    var agentId = "agent-45";
    var host = "www.appdbeacon.com";
    var mrumKey = "AAA-CCC-RRRR";
    var appName = "com.appdynamics";
    var mobilePlatform = "iOS";
    var body = "this is the body";
    var statusCode = 404;
    var req = nock("http://" + host)
      .post("/eumcollector/mobileMetrics?version=2")
      .reply(statusCode, body);

    sendMobileBeacon({beacon : "beacon"}, agentId, host, mrumKey, appName, mobilePlatform).then(function(result) {
      expect(result.body).toBe(body);
      expect(result.statusCode).toBe(statusCode);
      done();
    });
  });

  it("rejects promise when response takes longer than 5 seconds", function(done) {

    var agentId = "agent-45";
    var host = "www.appdbeacon.com";
    var mrumKey = "AAA-CCC-RRRR";
    var appName = "com.appdynamics";
    var mobilePlatform = "iOS";
    var req = nock("http://" + host)
      .post("/eumcollector/mobileMetrics?version=2")
      .socketDelay(8000)
      .reply(200, {});

      sendMobileBeacon({beacon : "beacon"}, agentId, host, mrumKey, appName, mobilePlatform).then(function(result) {
        expect(true).toBe(false);
        done();
      }).catch(function(reason) {
        expect(reason.code).toEqual("ESOCKETTIMEDOUT");
        done();
      });
  }, 10000);

});

describe("send delayed mobile beacon", function() {

  it("waits to send beacon", function(done) {

    var agentId = "agent-45";
    var host = "www.appdbeacon.com";
    var mrumKey = "AAA-CCC-RRRR";
    var appName = "com.appdynamics";
    var mobilePlatform = "iOS";
    var body = "this is the body";
    var statusCode = 404;
    var req = nock("http://" + host)
      .post("/eumcollector/mobileMetrics?version=2")
      .reply(statusCode, body);

    sendDelayedMobileBeacon(1000, {beacon : "beacon"}, agentId, host, mrumKey, appName, mobilePlatform).then(function(result) {
      expect(result.body).toBe(body);
      expect(result.statusCode).toBe(statusCode);
      done();
    });
  });
});

describe("send browser beacon", function() {

  //TODO - couldnt get headers to match with nock, not sure what I was doing wrong...
  it("sends beacon in body and resolves promise", function(done) {

    var host = "www.appdbeacon.com";
    var brumKey = 'AAA-CCC-RRRR';
    var body = "test the body";
    var userAgent = "Safari"
    var beacon = {
      name : "value"
    }
    var headers = {
      'User-Agent' : userAgent,
      'Content-Type' : 'text/plain',
      'Content-Length' : JSON.stringify(beacon).length,
      'Accept' : '*/*',
      'Host' : host
    };
    var statusCode = 404;
    var req = nock('http://' + host)
      .post('/eumcollector/beacons/browser/v1/'+ brumKey +'/adrum', beacon)
      .socketDelay(2000)
      .reply(statusCode, body);

    sendBrowserBeacon(beacon, userAgent, host, brumKey).then(function(result) {
      expect(result.body).toBe(body);
      expect(result.statusCode).toBe(statusCode);
      done();
    });
  });
});
