var bel = require('bel')

module.exports = function (items, onselected) {
  return bel`<div class="content configure-content">
    <ul class="table-view">
      ${items.length ? list() : empty()}
    </ul>
  </div`
      
  function list () {
    return items.map(function (item) {
      return bel`<li class="table-view-cell media">${button(item.id, item.label)}</li>`
    })
  }

  function empty () {
    return bel`<li class="table-view-cell media">
      <a class="navigate-right">
        <img class="media-object pull-left" src="img/dat-hex-small.png">
        <div class="media-body">
          Hello!
          <p>Create a Dat link by dropping some files here or clicking the plus above.</p>
        </div>
      </a>
    </li>`
  }

  function button (id, label) {
    return bel`<a class="navigate-right" onclick=${function () { onselected(id) }}>
      ${label}
    </a>`
  }
}
