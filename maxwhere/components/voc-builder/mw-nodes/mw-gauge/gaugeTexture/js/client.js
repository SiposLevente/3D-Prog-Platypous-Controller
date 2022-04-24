if (typeof require === 'undefined') {
  console.log('ERROR: browser was launched outside of electron');
  var ipcRenderer = {};
  ipcRenderer.send = function (data) {
    console.log('DUMMY ipcRenderer for debugging. sent data: ' + data);
  };
  ipcRenderer.on = function (data) {
    console.log('DUMMY ipcRenderer for debugging. event: ' + data);
  };
} else {
  var { ipcRenderer } = require('electron');
  if (ipcRenderer === null) {
    console.log('ERROR: browser was launched outside of electron');
    throw new Error('ERROR: browser was launched outside of electron');
  }
}
