
  if (typeof define === "function" && define.amd) {
    define(pw);
  } else if (typeof module === "object" && module.exports) {
    module.exports = pw;
  } else {
    this.pw = pw;
  }
})();
