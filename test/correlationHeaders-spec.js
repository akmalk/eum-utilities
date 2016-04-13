var correlationHeaders = require("../index.js").correlationHeaders;

describe("Correlation Headers", function() {

    it("returns correct values with 4.2 adrum headers from Java", function() {
        var headers = { date: 'Thu, 31 Mar 2016 23:21:54 GMT',
            server: 'Apache/2.4.6 (Red Hat)',
            adrum_0: 'clientRequestGUID:ae5f4eaf-0931-40ac-b582-14f720f296d4',
            adrum_1: 'globalAccountName:customer1_f569566d-7308-4ce3-9686-c4f004b9232b',
            adrum_2: 'btId:126',
            adrum_3: 'btERT:1027',
            'set-cookie': [ 'JSESSIONID=825BB01ACDAC4FAA96AEE2BCC26C23A9.route2; Path=/appdynamicspilot/; HttpOnly' ],
            'cart-size': '1',
            'cart-total': '5.95',
            adrum_4: 'btDuration:1005',
            'content-length': '0',
            connection: 'close' }

        expect(correlationHeaders(headers)).toEqual({
            clientRequestGUID : 'ae5f4eaf-0931-40ac-b582-14f720f296d4',
            globalAccountName : 'customer1_f569566d-7308-4ce3-9686-c4f004b9232b',
            btId : '126',
            btERT : '1027',
            btDuration: '1005'
        });

    });

    it('returns correct values with 4.1 adrum headers from Java', function() {
        var headers = { date: 'Thu, 31 Mar 2016 23:51:16 GMT',
            server: 'Apache/2.4.6 (Red Hat)',
            adrum_0: 'clientRequestGUID:5691c8f8-11d1-422c-89fa-bec500b7daab',
            adrum_1: 'btId:557',
            adrum_2: 'btERT:4',
            'set-cookie':
                [ 'JSESSIONID=3CED44D2C24847A8DE6E925CE8662111.route2; Path=/appdynamicspilot/; HttpOnly',
                    'ROUTEID=.route2; path=/' ],
            adrum_3: 'btDuration:4',
            'content-length': '0',
            connection: 'close' }


        expect(correlationHeaders(headers)).toEqual({
            clientRequestGUID : '5691c8f8-11d1-422c-89fa-bec500b7daab',
            btId : '557',
            btERT : '4',
            btDuration: '4'
        });
    });

    it('returns correct values with 4.1 adrum headers from PHP', function() {
        var headers = {
            date: 'Thu, 31 Mar 2016 23:56:48 GMT',
            server: 'Apache/2.4.7 (Ubuntu)',
            'x-powered-by': 'PHP/5.5.9-1ubuntu4.11',
            'cache-control': 'no-cache',
            adrum_0: 'clientRequestGUID%3A1a52bac0-e852-4b9f-bcc6-c597c287b4e617972',
            adrum_1: 'btERT%3A8',
            connection: 'close',
            'transfer-encoding': 'chunked',
            'content-type': 'text/html; charset=UTF-8' }


        expect(correlationHeaders(headers)).toEqual({
            clientRequestGUID : '1a52bac0-e852-4b9f-bcc6-c597c287b4e617972',
            btERT : '8',
        });
    });
});