var bel = require('bel')

module.exports = function (items, onselected) {
  return bel`<ul class="table-view">
  <li class="table-view-cell table-view-divider">Processes</li>
  ${items.map(function (item) {
    return bel`<li class="table-view-cell media">${button(item.id, item.label)}</li>`
  })}
  </ul>`

  function button (id, label) {
    return bel`<a class="navigate-right" onclick=${function () {
      onselected(id)
    }}>
      <span class="media-object pull-left icon icon-gear"></span> ${label}
    </a>`
  }
}

// <div class="content configure-content">
//   <ul class="table-view">
//     <li class="table-view-cell table-view-divider">Processes</li>
//     {{#items}}
//       <li class="table-view-cell media">
//         <a href="/detail/{{name}}" class="navigate-right">
//           <span class="media-object pull-left icon icon-gear"></span> {{name}}
//           {{#state == 'alive'}}<span class="badge badge-positive">Running</span>{{/state}}
//           {{#state == 'dead'}}<span class="badge badge-negative">Dead</span>{{/state}}
//           {{#state == 'stopped'}}<span class="badge">Not running</span>{{/state}}
//         </a>
//       </li>
//     {{/items}}
//     {{^items}}
//       <li class="table-view-cell media">No Processes Configured</li>
//     {{/items}}
//     <li class="table-view-cell table-view-divider">Actions</li>
//     {{#hasProcesses}}
//     <li class="table-view-cell media">
//       <a class="cursor-pointer" on-click="processAction" data-action="startAll">
//         <span class="media-object pull-left icon icon-play"></span>
//         <div class="media-body">
//           Start All
//         </div>
//       </a>
//     </li>
//     <li class="table-view-cell media">
//       <a class="cursor-pointer" on-click="processAction" data-action="stopAll">
//         <span class="media-object pull-left icon icon-stop"></span>
//         <div class="media-body">
//           Stop All
//         </div>
//       </a>
//     </li>
//     <li class="table-view-cell media">
//       <a class="cursor-pointer" on-click="processAction" data-action="restartAll">
//         <span class="media-object pull-left icon icon-refresh"></span>
//         <div class="media-body">
//           Restart All
//         </div>
//       </a>
//     </li>
//     {{/hasProcesses}}
//     <li class="table-view-cell media">
//       <a class="navigate-right" href="/about">
//         <span class="media-object pull-left icon icon-search"></span>
//         <div class="media-body">
//           About
//         </div>
//       </a>
//     </li>
//   </ul>
// </div>
// <div class="bar bar-standard bar-footer">
//   <button class="btn pull-left" on-click="openDir">
//     Open Config Folder
//   </button>
//   <button class="btn pull-right" on-click="quit">
//     Quit
//   </button>
// </div>
