var bel = require('bel')

module.exports = function (items, onselected) {
  return bel`<nav class="bar bar-nav">
    <a class="icon icon-plus pull-left"></a>
    <h1 class="title">Dat</h1>
    <a class="icon icon-gear pull-right"></a>
  </nav>`
}
