'use strict';

var _ = require("lodash"),
  geo = require("./browserCountries");

var browserGeo = {};

browserGeo.getRandomGeo = function() {
  var geo = {c : browserGeo.getRandomCountry()};
  return _.merge(geo, browserGeo.getRegion(geo.c));
}

browserGeo.getRandomCountry = function() {
  return geo.countries[_.random(0, (geo.countries.length -1))];
}

browserGeo.getRegion = function(country) {
  return geo.regions[country][0];
}

module.exports = browserGeo;
