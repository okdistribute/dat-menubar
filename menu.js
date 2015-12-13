module.exports = function (Ractive) {
  Ractive.events.menu = function (node, fire) {
    // intercept contextmenu events and suppress them
    var contextmenuHandler = function (event) {
      event.preventDefault()

      // we'll pass along some coordinates. This will make more sense below
      fire({
        node: node,
        original: event,
        x: event.clientX,
        y: event.clientY
      })
    }

    node.addEventListener('contextmenu', contextmenuHandler)
  }
}
