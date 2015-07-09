pw.init = {};

var initFns = [];
pw.init.register = function (fn) {
  initFns.push(fn);
};

document.addEventListener("DOMContentLoaded", function(event) {
  initFns.forEach(function (fn) {
    fn();
  });
});
