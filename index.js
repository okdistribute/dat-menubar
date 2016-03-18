var yo = require('yo-yo')
var extend = require('xtend')
var header = require('./components/header.js')
var body = require('./components/body.js')
var footer = require('./components/footer.js')

function onaction (action, params) {
  if (!action || action.length === 0) return
  if (action === 'home') return update({view: 'home'})
  if (action === 'add') return update({view: 'add'})
  if (action === 'settings') return update({view: 'settings'})
  if (action === 'detail') return update({view: 'detail', params: params})
  if (action === 'back') return update(previous[previous.length - 1]) // experimental
  console.error('Unknown action:', action)
}

window.onaction = onaction // for debugging
var previous = [] // experimental

var state = {
  view: 'home',
  dats: [{id: 'cool', label: 'cool data'}, {id: 'cooler', label: 'cooler data'}]
}

var container = render()
document.body.appendChild(container)

function render () {
  return yo`<div id="app">
    ${header(state, onaction)}
    ${body(state, onaction)}
    ${footer(state, onaction)}
  </div>`
}

function update (newState) {
  previous.push(state)
  state = extend(state, newState)
  yo.update(container, render())
}
