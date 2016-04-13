# eum-utilities
Bundle of utility functions to help with AppD EUM load in demo environment

## Functions

### correlationHeaders(headers)

Pass in normal header object from a response in node.js and will loop through and parse out AppDynamics headers related to e2e correlation. 

### getRandomIpFromCountry(country)

Pass in a country (e.g. United States), and get a random IP address that will be mapped to United States by geoip mapping databases. Note, the IP addresses are not updated/tested regularly, and may become stale. 

### getRandomIp(start, end)

Pass in two ip addresses, and get an IP address that falls between the two. E.g. getRandomIp('101.16.0.0','101.31.255.255') could return 101.18.0.12, but would not return 102.18.0.12.

### getCountriesMappedByIp

Get list of countries currently mapped to IP addresses - e.g. only countries in this list can be used with the function getRandomIpFromCountry.

## Testing

Run npm install to get jasmine (js testing framework), and then run npm test.

