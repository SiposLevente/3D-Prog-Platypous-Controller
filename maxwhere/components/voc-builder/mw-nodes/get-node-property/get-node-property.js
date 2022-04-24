const { wom } = require('maxwhere');

module.exports = function (RED) {
  function GetNodeProperty(config) {
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

      node.send({ payload: getProperty(settings.prop, mxWNode) });
    });
  }

  RED.nodes.registerType('get-node-property', GetNodeProperty);
};

function getProperty(type, node) {
  switch (type) {
    case 'position':
      return node.getPosition();
    case 'orientation':
      return node.getOrientation();
    case 'scale':
      return node.getScale();

    default:
      return '';
  }
}
