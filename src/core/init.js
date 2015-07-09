var fns = [];

pw.init = {
  register: function (fn) {
    fns.push(fn);
  }
};

document.addEventListener("DOMContentLoaded", function() {
  fns.forEach(function (fn) {
    fn();
  });
});
