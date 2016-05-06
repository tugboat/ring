var jsdom = require('jsdom');
var fs = require('fs');
var inspect = require('object-inspect');

function loadDoc (filename) {
  return jsdom.jsdom(fs.readFileSync('test/support/views/' + filename, 'utf8'));
}

// so we have a global document; do not run tests against this
document = loadDoc('document.html');

pw = {};

module.exports.expect = require("expect.js");
module.exports.loadDoc = loadDoc;
