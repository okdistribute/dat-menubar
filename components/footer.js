var yo = require('yo-yo')

module.exports = function (state, onaction) {
  var items = Object.keys(state.dats)
  return yo`<div class="bar bar-standard bar-footer">
    ${items.length ? stats() : empty()}
  </div>`

  function stats () {
    return yo`<nav class="bar bar-tab">
      <a class="tab-item" href="#">Sharing ${items.length > 1 ? items.length + ' Dats' : items.length + ' Dat'}</a>
    </nav>`
  }

  function empty () {
    return yo`<nav class="bar bar-tab">
      <a class="tab-item" href="#">Not Currently Sharing</a>
    </nav>`
  }
}
