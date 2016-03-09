var bel = require('bel')
var list = require('./components/list.js')

function onselected (id) {
  console.log('selected', id)
  // element.update(render(id))
}

function render (dats) {
  return bel`<div class="content configure-content">
    ${list(dats, onselected)}
  </div>`
}

var element = render([{id: 'foo', label: 'cool data'}])
document.querySelector('#container').appendChild(element)
