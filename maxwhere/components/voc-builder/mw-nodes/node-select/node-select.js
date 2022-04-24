const { wom } = require('maxwhere');

module.exports = function (RED) {
  function nodeSelect(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    node.on('input', (msg) => {
      msg.payload = wom.select(`#${config.settings.nodeid}`);
      node.send(msg);
    });
  }
  RED.nodes.registerType('node-select', nodeSelect);
};
