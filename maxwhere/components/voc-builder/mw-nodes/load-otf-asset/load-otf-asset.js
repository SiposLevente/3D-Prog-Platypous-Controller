const {
  wom,
  modules: {
    mxwAssetProxy,
    mxwStateProxy: { where },
  },
} = require('maxwhere');

module.exports = function (RED) {
  function LoadOTFAsset(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    let settings = config.settings;
    let filesNames = [];
    mxwAssetProxy
      .getAssetByName(settings.otf, (progress) => {
        console.log(progress.percent);
        node.status({
          fill: 'yellow',
          shape: 'dot',
          text: `Downloading ${progress.percent}%`,
        });
      })
      .then((files) => {
        console.log(files);
        node.status({ fill: 'green', shape: 'dot', text: 'Download finished' });
        node.send(files);
      })
      .catch((err) => {
        node.status({
          fill: 'red',
          shape: 'dot',
          text: 'Error while downloading',
        });
      });
  }

  RED.nodes.registerType('load-otf-asset', LoadOTFAsset);
};
