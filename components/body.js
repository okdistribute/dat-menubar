var yo = require('yo-yo')

module.exports = function (state, onaction) {
  if (state.view === 'home') {
    if (state.dats.length) return render(list)
    else return render(empty)
  }
  if (state.view === 'settings') return render(settings)
  if (state.view === 'detail') return render(detail)
  if (state.view === 'loading') return render(loading)

  function render (view) {
    return yo`<div class="content configure-content">
      ${view()}
    </div`
  }

  function list () {
    var dats = state.dats.map(function (item) {
      var dat = item.value
      return yo`<li class="table-view-cell media">${button(dat.link, dat.location)}</li>`
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

  function detail () {
    return yo`<h1>${state.params.id}</h1>`
  }

  function loading () {
    return yo`<h1>Loading</h1>`
  }

  function button (id, label) {
    return yo`<a class="navigate-right" onclick=${ function () { onaction('detail', {id: id}) } }>
      <span class="octicon octicon-package"></span>
      ${label}
    </a>`
  }
}
