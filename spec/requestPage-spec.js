var nock = require('nock'),
  request = require("request"),
  requestPage = require("../index.js").requestPage;

  describe("Request page", function() {

    it("should make request to url and then return promise with body, statusCode and headers", function(done) {

      var host = "http://www.ecomm.com";
      var path = "/foo";
      var statusCode = 404;
      var body = "This is the body"

      var req = nock(host)
        .get(path)
        .reply(statusCode, body);

      requestPage("get", host + path, request.jar(), null, null, 5000).then(function(result) {
        expect(result.body).toEqual(body);
        expect(result.statusCode).toEqual(statusCode);
        expect(result.headers).toBeDefined();
        done();
      })
    });

    it("should set custom headers", function(done) {

      var statusCode = 500;
      var body = "body";
      var req = nock("http://www.ecomm.com", {
          reqheaders : {
            foo : "bar"
          }
        })
        .get("/foo")
        .reply(statusCode, body);

        requestPage("get", "http://www.ecomm.com/foo", request.jar(), {foo : "bar"}, null, 5000).then(function(result) {
          expect(result.body).toEqual(body);
          expect(result.statusCode).toEqual(statusCode);
          expect(result.headers).toBeDefined();
          done();
        });
    });

    it("should post form", function(done) {

      var statusCode = 200;
      var body = "post body";
      var form = {
        first : "foo"
      }
      var req = nock("http://www.ecomm.com")
        .post("/foo", form)
        .reply(statusCode, body);

        requestPage("post", "http://www.ecomm.com/foo", request.jar(), null, form, 5000).then(function(result) {
          expect(result.body).toEqual(body);
          expect(result.statusCode).toEqual(statusCode);
          expect(result.headers).toBeDefined();
          done();
        });
    });

    it("should timeout", function(done) {

      var statusCode = 200;
      var body = "timeout body";

      var req = nock("http://www.ecomm.com")
        .get("/foo")
        .socketDelay(6000)
        .reply(statusCode, body);

        requestPage("get", "http://www.ecomm.com/foo", request.jar(), null, null, 5000).then(function(result) {
          expect(false).toEqual(true);
          done();
        }).catch(function(result) {
          expect(result).toBeDefined();
          done();
        });
    }, 10000)
  });
