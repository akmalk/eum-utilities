# eum-utilities
Bundle of utility functions to help with AppD EUM load in demo environment

## Functions

Various functions used to generate mobile and browser load

## Unit Testing

Run npm install to get jasmine (js testing framework), and then run npm test. All unit tests are located in the spec directory.

## End to End (e2e) Testing

e2e testing also relies on jasmine, and focuses on "live" scenarios, like POSTing a mobile beacon to a real EUM collector, or parsing out correlation headers from an application server running AppDynamics APM. This can be useful for troubleshooting issues, and validating new components (new Java agent, new version of EUM collector) don't break things.

To run a test, from the main directory, use something like ./node_modules/jasmine/bin/jasmine.js e2e/requestPageECommerce-e2e-spec.js
