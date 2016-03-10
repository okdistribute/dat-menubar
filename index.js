var bel = require('bel')
var header = require('./components/header.js')
var list = require('./components/list.js')
var footer = require('./components/footer.js')

function onselected (id) {
  console.log('selected', id)
}

var dats = [{id: 'foo', label: 'cool data'}, {id: 'foo', label: 'cooler data'}]
var container = document.querySelector('#container')
var headerEl = header(dats, onselected)
var listEl = list(dats, onselected)
var footerEl = footer(dats, onselected)
container.appendChild(headerEl)
container.appendChild(listEl)
container.appendChild(footerEl)
