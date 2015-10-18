# Pakyow on the client

**Ring** is a JavaScript library for dealing with UI state on the client side
of a Pakyow app. It's intended to be used with the
[pakyow-ui](https://github.com/pakyow/pakyow/tree/master/pakyow-ui) library and
in context of a full Pakyow app, not in a standalone fashion.

### Transformations

The core purpose behind Ring is to keep a rendered view in sync with the
current backend state of the application. This happens by establishing a
WebSocket connection with the server and applying transformations instructions
to the rendered view.

### Mutations

Ring handles the other side as well by interpreting user interaction as
mutations in application state. These mutations are automatically sent up the
established WebSocket to the backend where the mutation can be dealt with.

### Components

Custom components can be written that can interact with the server, receive
instructions from it, etc. Much of the functionality bundled with Ring is
implemented as components, including:

- FastLink: Processes links through the established WebSocket.
- Loader: Adds a loader to the page whenever Ring is waiting on the network.
- Mutable: Provides a mechanism for displaying pages in a modal context.
- Mutable: Interpret user interactions with a node as mutations in state.
- Navigator: Handles navigating through WebSockets rather than HTTP.
- Notifier: Presents notifications from the backend.

Use components by adding a `data-ui` attribute to the node.

### Standalone

Though Ring is designed to work in conjunction with a [Pakyow](https://github.com/pakyow/pakyow/) app running
server-side, it is possible to use some of the primitives to build standalone
browser based components. Take a look at `examples/todo.html` for more.

## Building

To smash all source files and build a new version, run this command:

    rake build

Output is sent to the `./build` directory.

## Unit Tests

Run the test suite:

    rake test
