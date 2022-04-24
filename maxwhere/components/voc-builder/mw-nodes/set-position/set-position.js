const { wom } = require('maxwhere');

module.exports = function (RED) {
  function SetPosition(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    node.on('input', (msg) => {
      let settings = config.settings;
      let mxWNode;
      if (settings.nodeid == 'camera') {
        mxWNode = wom.camera;
      } else {
        mxWNode = wom.select(`#${settings.nodeid}`);
      }

      if (settings.mode == 'local') {
        mxWNode.setPosition(
          settings.position,
          settings.reference,
          settings.space,
        );
      } else if (settings.mode == 'fromInput') {
        mxWNode.setPosition(msg.payload, settings.reference, settings.space);
      }

      msg.payload = 'Position is set';
      node.send(msg);
    });
  }

  RED.nodes.registerType('set-position', SetPosition);
};
