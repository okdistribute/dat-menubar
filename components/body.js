var yo = require('yo-yo')
var path = require('path')
var styles = require('./styles.js')
var spinner = require('./spinner.js')

module.exports = function (state, onaction) {
  if (state.view === 'home') {
    if (Object.keys(state.dats).length) return render(list())
    else return render(empty())
  }
  if (state.view === 'settings') return render(settings())
  if (state.view === 'detail') {
    var selected = state.params.dat
    return render(detail(selected))
  }
  if (state.view === 'loading') return render(loading())

  function render (view) {
    return yo`<div class="content configure-content">
      ${view}
    </div`
  }

  function list () {
    var dats = Object.keys(state.dats)
    dats = dats.map(function (key) {
      return datItem(state.dats[key])
    })
    return yo`<ul class="table-view">${dats}</ul>`
  }

  function empty () {
    return yo`<ul class="table-view">
      <li class="table-view-cell media">
        <a onclick=${ function () { onaction('add') } } class="navigate-right">
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
    var active = dat.state === 'active'
    return yo`<ul class="table-view">
      <li class="table-view-cell table-view-divider">${dat.dir}</li>
      <li class="table-view-cell small-text">dat://${dat.link} <button onclick=${
          function () { onaction('copy', 'dat://' + dat.link) }
        } class="btn"><span class="octicon octicon-clippy"></span><span>Copy</span></button></li>
      <li class="table-view-cell" >
        <a onclick=${ function () { onaction(active ? 'stop' : 'start', dat) } }>
          <span class="media-object pull-left icon icon-${active ? 'stop' : 'play'}"></span>
          <span class="badge">${dat.state}</span>
          <div class="media-body">${active ? 'Stop' : 'Start'}</div>
        </a>
      </li>
      <li class="table-view-cell" >
        <a onclick=${ function () { onaction('delete', dat) } }>
          <span class="media-object pull-left icon icon-trash"></span>
          <div class="media-body">Remove</div>
        </a>
      </li>
    </ul>`
  }

  function loading () {
    return spinner()
  }

  function datItem (dat) {
    var dir = path.basename(dat.dir)
    var tooltip = dat.dir
    var badge = dat.state
    return yo`<li class="table-view-cell media">
      ${button(dat.dir, dir, badge, tooltip)}
    </li>`
  }

  function button (id, label, badge, tooltip) {
    return yo`<a class="navigate-right" onclick=${ function () { onaction('detail', {id: id}) } }>
      <span class="badge">${badge}</span>
      <span class="${styles.tooltip} ${styles['tooltip-right']}" data-tooltip="${tooltip}">${label}</span>
    </a>`
  }
}
