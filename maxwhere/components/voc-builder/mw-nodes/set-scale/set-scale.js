const { wom } = require('maxwhere');

module.exports = function (RED) {
  function SetScale(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    node.on('input', (msg) => {
      let settings = config.settings;
      let mxWNode = wom.select(`#${settings.nodeid}`);

      if (settings.mode == 'local') {
        mxWNode.setScale(settings.scale, settings.reference, settings.space);
      } else if (settings.mode == 'fromInput') {
        mxWNode.setScale(msg.payload, settings.reference, settings.space);
      }

      msg.payload = 'Scale is set';
      node.send(msg);
    });
  }

  RED.nodes.registerType('set-scale', SetScale);
};
