if (!Object.prototype.pairs) {
  Object.prototype.pairs = function () {
    Object.keys(this).map(function (key) {
      [key, this[key]];
    }, this);
  };
}
