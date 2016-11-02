'use strict';

var _ = require('lodash'),
  qs = require('querystring'),
  countryIpMap = require('./lib/countryIpMap'),
  browserGeo = require("./lib/browserGeo"),
  browserAgent = require("./lib/browserAgent"),
  ipAddress4 = require('ip-address').Address4,
  request  = require('request'),
  winston = require("winston"),
  zlib = require('zlib');

var eumUtilities = {};

/**
* Get browser session data
*
* Data used to populate beacon, randomly generated
*
* @return {object}
*/
eumUtilities.getBrowserSessionData = function() {
  var geo = browserGeo.getRandomGeo();
  return {
    geo : geo,
    geoIp : eumUtilities.getRandomIpFromCountry(geo.c),
    sessionGuid : eumUtilities.createBrowserGUID(),
    browser : browserAgent.getRandomBrowser()
  }
}

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

eumUtilities.browserMultipleSessions = function(loggerConfig, number, getPages, beacons, beaconHost, brumKey) {

  for (var i = 0; i < number; i++) {
    eumUtilities.browserStartSession(eumUtilities.configLogger(loggerConfig, "session" + i + "-"), getPages, beacons, beaconHost, brumKey);
  }
}

eumUtilities.configLogger = function(loggerConfig, fileNamePrefix) {
  var logFilePath = ((process.cwd().indexOf('src') !== -1) ? '../logs/' : 'logs/');
  var transports = [];
  if (loggerConfig.logFile === "true") {
    transports.push(new (winston.transports.File)({
      name : 'file',
      filename : logFilePath + fileNamePrefix + Date.now()  + ".log",
      level : loggerConfig.logLevel
    }))
  }
  if (loggerConfig.logConsole === "true") {
    transports.push(new (winston.transports.Console)({
      name : 'console',
      level : loggerConfig.logLevel
    }))
  }
  return new winston.Logger({
      transports : transports
  });
}

eumUtilities.browserStartSession = function(logger, getPages, beacons, beaconHost, brumKey) {

  var sessionData = eumUtilities.getBrowserSessionData();
  sessionData.pages = getPages();
  sessionData.jar = request.jar();
  logger.info("Starting new session", sessionData);
  eumUtilities.browserProcessStep(sessionData, logger, getPages, beacons, beaconHost, brumKey);
}

eumUtilities.browserProcessStep = function(sessionData, logger, getPages, beacons, beaconHost, brumKey) {

  if (sessionData.pages.length === 0) {
    logger.info("End of session", sessionData);
    return eumUtilities.browserStartSession(logger, getPages, beacons, beaconHost, brumKey);
  }

  var currentPage = sessionData.pages.shift();

  if (currentPage.drop && (_.random(1,100) < currentPage.drop)) {
      logger.info("Dropping session at page " + currentPage.url);
      return eumUtilities.browserStartSession(logger, getPages, beacons, beaconHost, brumKey);
  }

  if (!_.isNull(currentPage.form) && _.isFunction(currentPage.form)) {
    currentPage.form = currentPage.form();
  }

  var method = _.isNull(currentPage.form) ? 'get' : 'post';
  logger.debug("Requesting page ", {url : currentPage.url, method : method});
  if (currentPage.form) {
    logger.debug("With form data", currentPage.form);
  }
  var requestStart = Date.now();
  eumUtilities.requestPage(method, currentPage.url, sessionData.jar, null, currentPage.form, 60000).then(function(result) {

    logger.info("Page successfully returned ", {url : currentPage.url, statusCode : result.statusCode});
    logger.debug("Page headers", result.headers);

    if (currentPage.beacon) {
      var requestEnd = Date.now();
      var beacon = beacons[currentPage.beacon]();
      eumUtilities.alterStandardBrowserBeacon(beacon, sessionData.sessionGuid, sessionData.geo);
      var correlationInfo = eumUtilities.correlationHeaders(result.headers);
      logger.debug("Correlation info", correlationInfo);
      eumUtilities.updateCorrelationInBrowserBeacon(beacon, correlationInfo);
      eumUtilities.updateMetrics(beacon, (requestEnd - requestStart));
      eumUtilities.browserCapabilities(beacon, sessionData.browser);

      eumUtilities.sendBrowserBeacon(beacon, sessionData.browser.agent, beaconHost, brumKey).then(function(result) {
        logger.info("beacon sent for " + currentPage.url);
      }).catch(function(reason) {
        logger.error("beacon error for " + currentPage.url, reason);
      });
    }

    var timeout = _.random(2000, 8000);
    logger.debug("Waiting for next step : " + timeout + " milliseconds");
    setTimeout(function() {
      return eumUtilities.browserProcessStep(sessionData, logger, getPages, beacons, beaconHost, brumKey);
    }, timeout);
  }).catch(function(reason) {
    logger.error("Error requesting application page : " + currentPage.url, reason);
    return eumUtilities.browserStartSession(logger, getPages, beacons, beaconHost, brumKey);
  });
}

/**
* Alter standard browser beacon
*
* Alter common fields in browser beacon, like timestamps, guids, geo, etc...
*
* @param {Object} beacon browser beacon
* @param {String} sessionGUID sessionGUID EUM collector expects
* @param {Object} geo geo object EUM collector expects
*
* @return {Object}
*/
eumUtilities.alterStandardBrowserBeacon = function(beacon, sessionGUID, geo) {

  var ts = Date.now();
  beacon.es[0].ts = ts;
  beacon.es[0].mx.ts = ts;
  beacon.es[0].mc.ts = ts;
  beacon.es[0].rt.t = ts;
  beacon.gs[0] = eumUtilities.createBrowserGUID();
  beacon.ai = sessionGUID;
  beacon.ge = geo;
  return beacon;
}

/**
* Update correlation information in browser beacon
*
* @param {object} beacon
* @param {object} correlationInfo Object with key/values as returned by correlationHeaders function
*
* @return {void}
*/
eumUtilities.updateCorrelationInBrowserBeacon = function(beacon, correlationInfo) {

    if (!beacon.es[0].sm) {
        return;
    }

    if (correlationInfo.clientRequestGUID) {
        beacon.gs[0] = correlationInfo.clientRequestGUID;
    }
    if (correlationInfo.globalAccountName) {
        beacon.es[0].sm.btgan = correlationInfo.globalAccountName;
    }
    if (correlationInfo.btId) {
        beacon.es[0].sm.bt[0].id = correlationInfo.btId;
    }
    if (correlationInfo.btERT) {
        beacon.es[0].sm.bt[0].ert = correlationInfo.btERT;
    }
}

/**
 * Update Metrics
 *
 * PLT - Page Load Time | End User Reponse Time
 * FBT - First Byte Time
 * DRT - HTML Download and DOM Building
 * DOM - DOM Ready
 * PRT - Resource Fetch Time
 * FET - Front End Time (only appears in snapshots for browsers that ????)
 *
 * RAT - Response Available Time -> time for request to be sent to server and first byte back from server
 * DDT - HTML Download Time
 * DPT - DOM Building Time
 *
 * @param {object} beacon default beacon
 * @param {integer} HTMLDownloadTime time recorded to download page by script
 */
eumUtilities.updateMetrics = function(beacon, HTMLDownloadTime) {

    HTMLDownloadTime = (HTMLDownloadTime > 20) ? HTMLDownloadTime : 20;
    beacon.es[0].mc.FBT = HTMLDownloadTime;
    beacon.es[0].mc.DRT = _.random(100, 250);
    beacon.es[0].mc.PRT = _.random(5, 500);

    beacon.es[0].mc.DOM = beacon.es[0].mc.FBT + beacon.es[0].mc.DRT;
    beacon.es[0].mc.PLT = beacon.es[0].mc.DOM + beacon.es[0].mc.PRT;
    beacon.es[0].mc.FET = beacon.es[0].mc.DRT + beacon.es[0].mc.PRT;

    if (beacon.es[0].mx) {
        beacon.es[0].mx.FBT = HTMLDownloadTime;
        beacon.es[0].mx.DRT = beacon.es[0].mc.DRT;
        beacon.es[0].mx.DDT = _.random(2, 30);
        beacon.es[0].mx.PRT = beacon.es[0].mc.PRT

        beacon.es[0].mx.DPT = beacon.es[0].mx.DRT - beacon.es[0].mx.DDT;
        beacon.es[0].mx.RAT = beacon.es[0].mx.FBT - beacon.es[0].mx.SCT;
        beacon.es[0].mx.DOM = beacon.es[0].mx.FBT + beacon.es[0].mx.DRT;
        beacon.es[0].mx.PLT = beacon.es[0].mx.DOM + beacon.es[0].mx.PRT;
        beacon.es[0].mx.FET = beacon.es[0].mx.DRT + beacon.es[0].mx.PRT;
    }

    if (beacon.es[0].rt) {
        beacon.es[0].rt.r.forEach(function(resource, i) {
            if (i === 0) {
                resource.m[10] = beacon.es[0].mx.FBT + beacon.es[0].mx.DDT;
                resource.m[9] = resource.m[10] - 2;
            } else {
                resource.o += HTMLDownloadTime;
            }
        });
    }

}

/**
* Browser Capabilities
*
* Update beacon to remove fields that are not consistent with browser type
*
* @param {object} beacon
* @param {object} browserInfo
* @return {void} null
*/
eumUtilities.browserCapabilities = function(beacon, browserInfo) {
  if (browserInfo.timing === 'nav' || browserInfo.timing === 'none') {
      delete beacon.es[0].rt;
  }
  if (browserInfo.timing === 'none') {
      delete beacon.es[0].mx;
  }
  if (!browserInfo.storage) {
      delete beacon.ai;
      delete beacon.es[0].si;
  }
}

/**
 * Create browser GUID
 *
 * Sample GUID - 8a3c1905_1a08_297e_bb32_441eb9f86962
 *
 * @returns {string}
 */
eumUtilities.createBrowserGUID = function() {

  var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
  var g = "";
  for( var i=0; i < 36; i++ ) {
      if (i === 8 || i === 13 || i === 18 || i === 23) {
          g += '_';
      } else {
          g += possible.charAt(Math.floor(Math.random() * possible.length));
      }
  }
  return g;
}

/**
* Request a page
*
* @param {String} method
* @param {String} url Full url including http://
* @param {Object} sessionJar object returned from request.jar()
* @param {Object} headers
* @param {Object} form
* @param {Number} timeout
*
* @returns {Promise}
*/
eumUtilities.requestPage = function(method, url, sessionJar, headers, form, timeout) {

  var options = {
      url : url,
      jar : sessionJar,
      headers : {
          'ADRUM' : 'isAjax:true',
          'ADRUM_1' : 'isMobile:true'
      },
      timeout : timeout
  };
  options.headers = _.merge(options.headers, headers);
  if (form) {
    options.form = form;
  }
  return makeRequest(method, options);
}

/**
 * Parse out AppD correlation headers
 *
 * The keys set on the return object are taken from values, and could change
 * if the appD server agent changes the headers names
 *
 * @param {Object} headers
 *
 * @return {Object}
 */
eumUtilities.correlationHeaders = function(headers) {

  return _(headers)
    .filter( (value, key) => key.indexOf('adrum') > -1)
    .map(value =>  qs.unescape(value).split(':'))
    .fromPairs()
    .value();
}

/**
* Send delayed mobile beacon
*
* @param {Number} delay
* @param {Object} beacon
* @param {String} agentId
* @param {String} host
* @param {String} mrumKey
* @param {String} appName
* @param {String} mobilePlatform
*
* @returns {Promise}
*/
eumUtilities.sendDelayedMobileBeacon = function(delay, beacon, agentId, host, mrumKey, appName, mobilePlatform) {

  var promise = new Promise( function (resolve, reject) {
    setTimeout(function() {
      eumUtilities.sendMobileBeacon(beacon, agentId, host, mrumKey, appName, mobilePlatform).then(function(value) {
        resolve(value)
      }).catch(function(reason) {
        reject(reason);
      });
    }, delay);
  });
  return promise;
}

/**
* Send mobile beacon
*
* @param {Object} beacon
* @param {String} agentId
* @param {String} host
* @param {String} mrumKey
* @param {String} appName
* @param {String} mobilePlatform
*
* @returns {Promise}
*/
eumUtilities.sendMobileBeacon = function(beacon, agentId, host, mrumKey, appName, mobilePlatform) {

  var promise = new Promise( function (resolve, reject) {
    zlib.gzip(JSON.stringify(beacon), function(error, gzippedBeacon) {
        if (error) {
          return reject(error);
        }
        var options = {
          url : "http://" + host + "/eumcollector/mobileMetrics?version=2",
          headers : mobileBeaconHeaders(mrumKey, appName, mobilePlatform, agentId),
          body : gzippedBeacon
        }
        sendBeacon(options).then(function(value) {
          return resolve(value);
        }).catch(function(reason) {
          return reject(reason);
        });
    });
  });
  return promise;
}

/**
* Send browser beacon
*
* @param {Object} beacon
* @param {String} userAgent
* @param {String} host
* @param {String} brumKey
*
* @returns {Promise}
*/
eumUtilities.sendBrowserBeacon = function(beacon, userAgent, host, brumKey) {

  var strBeacon = JSON.stringify(beacon);
  var options = {
    url : 'http://' + host + '/eumcollector/beacons/browser/v1/'+ brumKey +'/adrum',
    headers : browserBeaconHeaders(host, userAgent, strBeacon.length),
    body : strBeacon
  }

  return sendBeacon(options);
}


/******************
* HELPER FUNCTIONS
******************/

/**
* Send beacon, and adds timeout value
*
* @param {Object} options
*
* @return {Promise}
*/
function sendBeacon(options) {

  options.timeout = 5000;
  return makeRequest('post', options);
}

/**
* Make an HTTP request
*
* @param {String} method
* @param {Object} options
*
* @return {Promise}
*/
function makeRequest(method, options) {
  var promise = new Promise( function (resolve, reject) {
      request[method](options, function(error, response, body) {
          if (error) {
              return reject(error);
          }
          return resolve({headers : response.headers, statusCode : response.statusCode, body : body});
      });
  });
  return promise;
}

/**
* Mobile beacon headers
*
* @param {String} mrumKey
* @param {String} appName
* @param {String} mobilePlatform
* @param {String} agentId
*/
function mobileBeaconHeaders(mrumKey, appName, mobilePlatform, agentId) {
  return {
    'User-Agent' : 'SimpleURL/1 CFNetwork/711.1.12 Darwin/13.4.0',
    'Content-Type' : 'application/x-www-form-urlencoded',
    'Accept' : '*/*',
    'mat' : '-1',
    'ky' : mrumKey,
    'an' : appName,
    'osn' : mobilePlatform,
    'gzip' : 'true',
    'di' : agentId,
    'bid' : '1a9d6f577463cca8d8f0720e279d007',
    'cap' : 's:1'
  };
}

/**
* Browser beacon headers
*
* @param {String} host
* @param {String} userAgent
* @param {String} beaconLength
*/
function browserBeaconHeaders(host, userAgent, beaconLength) {
  return {
    'User-Agent' : userAgent,
    'Content-Type' : 'text/plain',
    'Content-Length' : beaconLength,
    'Accept' : '*/*',
    'Host' : host
  };
}

/***************
* EXPORT
****************/
module.exports = eumUtilities;
