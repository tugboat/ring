Need the ability to do the following:

- understand a view's state
- handle state mutation triggers
- application of state from diff
- websocket support

- components
- close to the metal ajax, dom manip, etc
  - these should be built to make implementation of other lib aspects easier

# Representing State Mutations

Should be represented in a way that allows peer-to-peer sharing but also understandable by the backend for interpreting data changes from ui state mutations.

Task state change:

task: {
  id: 1,
  checked: true
}

List task order change:

list: {
  id: 1,
  order: [3,1,2]
}

These mutations are easily mapped to restful routes.

# Applying State Mutations

The ui receives the diff, plus the application method.

Applying task state change:

bind: {
  task: {
    id: 1,
    checked: true
  }
}

Applying list task order change:

apply: {
  list: {
    id: 1,
    order: [3,1,2]
  }
}
