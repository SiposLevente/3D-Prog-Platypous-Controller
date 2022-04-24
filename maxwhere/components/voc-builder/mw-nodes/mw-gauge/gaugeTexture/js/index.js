const { RadialGauge } = require('canvas-gauges');
const $ = require('jquery');

let defaultOptions = {
  needle: false,
  valueBox: false,
};

ipcRenderer.on('gaugeTextureInit', function (event, options) {
  var gaugeTexture = new RadialGauge(
    Object.assign(options, defaultOptions, { renderTo: 'gaugeCanvas' }),
  ).draw();
  setTimeout(() => {
    ipcRenderer.send(options.imageFilename, options);
  }, 300);
});
