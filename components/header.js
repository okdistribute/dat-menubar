var yo = require('yo-yo')

module.exports = function (state, onaction) {
  var views = {}

  views.home = function () {
    return yo`<nav class="bar bar-nav">
        <a class="icon icon-plus pull-left" onclick=${ function () { onaction('add') } }></a>
        <h1 class="title">Dat</h1>
        <a class="icon icon-gear pull-right" onclick=${ function () { onaction('settings') } }></a>
      </nav>`
  }

  views.add = function () {
    return yo`<nav class="bar bar-nav">
        <a class="icon icon-back pull-left" onclick=${ function () { onaction('home') } }></a>
        <h1 class="title">Add</h1>
      </nav>`
  }

  views.settings = function () {
    return yo`<nav class="bar bar-nav">
        <a class="icon icon-back pull-left" onclick=${ function () { onaction('home') } }></a>
        <h1 class="title">Settings</h1>
      </nav>`
  }

  views.detail = function () {
    return yo`<nav class="bar bar-nav">
        <a class="icon icon-back pull-left" onclick=${ function () { onaction('home') } }></a>
        <h1 class="title">Details</h1>
      </nav>`
  }

  return views[state.view]()
}
