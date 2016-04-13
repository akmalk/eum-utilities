'use strict';

var _ = require('lodash'),
    qs = require('querystring'),
    countryIpMap = require('./countryIpMap'),
    ipAddress4 = require('ip-address').Address4;

var eumUtilities = {};

/**
 * Parse out AppD correlation headers
 *
 * @param {Object} headers
 * @return {Object}
 */
eumUtilities.correlationHeaders = function(headers) {

    return _(headers)
        .filter( (value, key) => key.indexOf('adrum') > -1)
        .map(value =>  qs.unescape(value).split(':'))
        .fromPairs()
        .value();
};

/**
 * Get random ip address for a given country
 *
 * @param {String} country
 */
eumUtilities.getRandomIpFromCountry = function(country) {

    if (!_.has(countryIpMap, country)) {
        throw new Error(country + ' not defined in countryIpMap');
    }

    var ipRange = _.sample(countryIpMap[country]);
    return eumUtilities.getRandomIp(ipRange.start, ipRange.stop);
};

/**
 * Get random ip address between start and stop
 *
 * @param {String} startIp
 * @param {String} stopIp
 * @returns {String}
 */
eumUtilities.getRandomIp = function(startIp, stopIp) {

    var arrStop = new ipAddress4(stopIp).toArray();
    return _(new ipAddress4(startIp).toArray()).reduce((result, value, key) => {
        return result + "." + _.random(value, arrStop[key]);
    });
};

/**
 * Get country names defined for IPs
 *
 * @returns {Array}
 */
eumUtilities.getCountriesMappedByIp = function() {

    return _.keys(countryIpMap);
};


module.exports = eumUtilities;