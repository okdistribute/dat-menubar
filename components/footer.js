var bel = require('bel')

module.exports = function (items, onselected) {
  return bel`<div class="bar bar-standard bar-footer">
    ${items.length ? stats() : empty()}
  </div>`
    
  function stats () {
    return bel`<nav class="bar bar-tab">
      <a class="tab-item" href="#">Sharing ${items.length > 1 ? items.length + ' Dats' : items.length + ' Dat'}</a>
    </nav>`
  }
  
  function empty () {
    return bel`<nav class="bar bar-tab">
      <a class="tab-item" href="#">Not Currently Sharing</a>
    </nav>`
  }
}
