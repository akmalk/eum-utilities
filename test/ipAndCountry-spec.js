var lib = require('../index.js'),
    randomIpCountry = lib.getRandomIpFromCountry,
    randomIp = lib.getRandomIp,
    countryList = lib.getCountriesMappedByIp,
    ipAddress4 = require('ip-address').Address4;

describe("Get Random Ip From Country", function() {

    it('throws error when country not defined', function() {

        expect(function() {
            randomIpCountry('Foo');
        }).toThrow(new Error('Foo not defined in countryIpMap'));

    });

    it('returns IP address for United States', function() {

        expect(randomIpCountry('United States')).toBeTruthy();

    });

    it('get list of countries and get ip address from each one', function() {
        var cl = countryList();

        expect(cl.length).toBeGreaterThan(10);
        expect(cl).toContain('United States');

        cl.forEach(value => {
            expect(randomIpCountry(value)).toBeDefined();
        });
    });
});

describe('Get Random Ip', function() {

    it('returns same ip address when both params are the same', function() {

        expect(randomIp('127.3.4.7', '127.3.4.7')).toBe('127.3.4.7');

    });

    it('returns ip address within expect bounds', function() {

        var random = randomIp('100.44.0.42','100.47.255.105');
        var arrIp = new ipAddress4(random).toArray();

        expect(arrIp[0]).toBe(100);
        expect(arrIp[1]).toBeGreaterThan(43);
        expect(arrIp[1]).toBeLessThan(48);
        expect(arrIp[2]).toBeGreaterThan(-1);
        expect(arrIp[2]).toBeLessThan(256);
        expect(arrIp[3]).toBeGreaterThan(41);
        expect(arrIp[3]).toBeLessThan(106);
    });
});