# 0.2.3

  * Adds broadcast bubbling to components

# 0.2.2 / 2016-01-13

  * Navigator now scrolls the page to the top
  * Fastlink now respects cmd-click
  * Modal supports a config href value

# 0.2.1 / 2015-12-18

  * Now scoped form submissions are intercepted by `mutable`
  * Sets page title as html rather than text
  * Prevents page flicker when changing pages in `navigator
  * Fixes several bugs with view matching
  * Adds a config option to `mutable` that prevents a revert
  * Response is now acknowledged by `mutable` even if it's a bad request
  * Binding now only sets a value for a prop if one is present
  * Now properly creates a view containing table elements (e.g. `tr`)

# 0.2.0 / 2015-11-25

  * Navigator handles queries for partials
  * Modal supports defining a template as part of the component
  * Mutable no longer reverts when it receives a bad request
  * Notifier can now be invoked from the backend
  * Properly sets the value of a textarea
  * Keeps the websocket alive by pinging the server on an interval
  * Renames functions conflicting with reserved words

# 0.1.0 / 2015-10-18

  * Initial release
