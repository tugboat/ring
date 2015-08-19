if (!Object.prototype.pairs) {
  Object.defineProperty(Object.prototype, "pairs", {
    value: function() {
      return Object.keys(this).map(function (key) {
        return [key, this[key]];
      }, this);
    },
    enumerable: false
  });
}
