var alterStandardBrowserBeacon = require("../index.js").alterStandardBrowserBeacon,
  updateCorrelationInBrowserBeacon = require("../index.js").updateCorrelationInBrowserBeacon;

describe("Alter browser beacon", function() {

  beforeEach(function() {

      this.standardBeacon = {
        es : [
          {
            ts : null,
            mx : {ts : null},
            mc : {ts : null},
            rt : {t : null},
            sm : {btgan : null, bt : [{id : null, ert : null}]}
          }
        ],
        gs : [],
        ai : null,
        ge : null
      }

      this.sessionGUID = 'ASD-4324';
      this.geo = {c : 'Spain', r : 'Madrid', t : 'Madrid' };

      this.correlationInfo = {
        clientRequestGUID: '9ea23d69-1e3d-4610-8dd3-59e84d67094a',
        globalAccountName: 'customer1_f16aea9b-844d-476d-92db-60f3acaa620d',
        btId: '564',
        btERT: '68',
        serverSnapshotType: 'f'
      };
  });

  it("should update timestamp, geo and GUIDS on the beacon", function() {

    var date = Date.now() - 1;
    var beacon = alterStandardBrowserBeacon(this.standardBeacon, this.sessionGUID, this.geo);

    expect(beacon.es[0].ts).toBeGreaterThan(date);
    expect(beacon.es[0].mx.ts).toBeGreaterThan(date);
    expect(beacon.es[0].mc.ts).toBeGreaterThan(date);
    expect(beacon.es[0].rt.t).toBeGreaterThan(date);
    expect(beacon.gs[0]).toBeDefined();
    expect(beacon.ai).toBeDefined();
    expect(beacon.ge).toEqual(this.geo);
  })

  it("should update correlationInfo on beacon", function() {

    updateCorrelationInBrowserBeacon(this.standardBeacon, this.correlationInfo);
    expect(this.standardBeacon.gs[0]).toBe("9ea23d69-1e3d-4610-8dd3-59e84d67094a");
    expect(this.standardBeacon.es[0].sm.btgan).toBe("customer1_f16aea9b-844d-476d-92db-60f3acaa620d");
    expect(this.standardBeacon.es[0].sm.bt[0].id).toBe("564");
    expect(this.standardBeacon.es[0].sm.bt[0].ert).toBe("68");
  })

  it("should not error when trying to update beacon correlationInfo is not present in object", function() {

    updateCorrelationInBrowserBeacon(this.standardBeacon, {});
    expect(this.standardBeacon.gs[0]).not.toBeDefined();
    expect(this.standardBeacon.es[0].sm.btgan).toBe(null);
    expect(this.standardBeacon.es[0].sm.bt[0].id).toBe(null);
    expect(this.standardBeacon.es[0].sm.bt[0].ert).toBe(null);
  })
});
