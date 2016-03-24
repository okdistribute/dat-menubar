var yo = require('yo-yo')
var path = require('path')
var styles = require('./styles.js')
var spinner = require('./spinner.js')

module.exports = function (state, onaction) {
  if (state.view === 'home') {
    if (state.dats.length) return render(list())
    else return render(empty())
  }
  if (state.view === 'settings') return render(settings())
  if (state.view === 'detail') {
    var selected = state.dats.find(function (d) {
      if (d.value.link === state.params.id) return true
    })
    return render(detail(selected))
  }
  if (state.view === 'loading') return render(loading())

  function render (view) {
    return yo`<div class="content configure-content">
      ${view}
    </div`
  }

  function list () {
    var dats = state.dats.map(function (item) {
      var dat = item.value
      var dir = path.basename(dat.location)
      var tooltip = dat.location
      return yo`<li class="table-view-cell media">${button(dat.link, dir, tooltip)}</li>`
    })
    return yo`<ul class="table-view">${dats}</ul>`
  }

  function empty () {
    return yo`<ul class="table-view">
      <li class="table-view-cell media">
        <a class="navigate-right">
          <img class="media-object pull-left" src="img/dat-hex-small.png">
          <div class="media-body">
            Hello!
            <p>Create a Dat link by dropping some files here or clicking the plus above.</p>
          </div>
        </a>
      </li>
    </ul>`
  }

  function settings () {
    return yo`<h1>SETTINGS</h1>`
  }

  function detail (dat) {
    console.log(dat)
    return yo`<ul class="table-view">
      <li class="table-view-cell table-view-divider">Share Link</li>
      <li class="table-view-cell small-text">dat://${dat.value.link} <button onclick=${
          function () { onaction('copy', 'dat://' + dat.value.link) }
        } class="btn"><span class="octicon octicon-clippy"></span><span>Copy</span></button></li>
      <li class="table-view-cell">Status <button class="btn btn-positive">${dat.value.state}</button></li>
      <li class="table-view-cell table-view-divider">Actions</li>
      <li class="table-view-cell" >
        <a onclick=${ function () { onaction('start', {name: dat.key}) } }>
          <span class="media-object pull-left icon icon-play"></span>
          <div class="media-body">Start</div>
        </a>
      </li>
      <li class="table-view-cell" >
        <a onclick=${ function () { onaction('stop', {name: dat.key}) } }>
          <span class="media-object pull-left icon icon-stop"></span>
          <div class="media-body">Stop</div>
        </a>
      </li>
      <li class="table-view-cell" >
        <a onclick=${ function () { onaction('delete', {name: dat.key}) } }>
          <span class="media-object pull-left icon icon-trash"></span>
          <div class="media-body">Remove</div>
        </a>
      </li>
    </ul>`
  }

  function loading () {
    return spinner()
  }

  function button (id, label, tooltip) {
    return yo`<a class="navigate-right" onclick=${ function () { onaction('detail', {id: id}) } }>
      <span class="${styles.tooltip} ${styles['tooltip-right']}" data-tooltip="${tooltip}">${label}</span>
    </a>`
  }
}
