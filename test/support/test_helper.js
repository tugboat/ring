var jsdom = require('jsdom');
var fs = require('fs');
var inspect = require('object-inspect');

function loadDoc () {
  return jsdom.jsdom(fs.readFileSync('test/support/views/significance/document.html', "utf8"));
}

// so we have a global document; do not run tests against this
document = loadDoc();

pw = {};

module.exports.expect = require("expect.js");
