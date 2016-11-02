var sendBrowserBeacon = require("../index.js").sendBrowserBeacon,
  alterStandardBrowserBeacon = require("../index.js").alterStandardBrowserBeacon,
  createBrowserGUID = require("../index.js").createBrowserGUID,
  origBeacon = require("./assets/ecommerceBeacon.json");

/*******************************************************************************
* These tests post beacons to a EUM collector. Change constants below.
* You will need to manually verify the data appears as expected in controller
*******************************************************************************/

const EUM_COLLECTOR = "shadow-master-eum-col.appdynamics.com"; // col.eum-appdynamics.com 
const BRUM_KEY = "SM-AAB-AAB-UZX";

describe("send browser beacon", function() {

  beforeEach(function() {
    this.beacon = JSON.parse(JSON.stringify(origBeacon));
  });

  it("to eum collector as IE9 user agent and from Madrid", function(done) {

    var beacon = alterStandardBrowserBeacon(this.beacon, createBrowserGUID(), {c : 'Spain', r : 'Madrid', t : 'Madrid' })
    sendBrowserBeacon(beacon, "Mozilla/5.0 (Windows; U; MSIE 9.0; WIndows NT 9.0; en-US))", EUM_COLLECTOR, BRUM_KEY).then(function(result) {
        expect(result.statusCode).toBe(200);
        done();
    })
  })
});
