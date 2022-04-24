const { wom } = require('maxwhere');

module.exports = function (RED) {
  function Offset(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    node.on('input', (msg) => {
      let offset = config.settings.offset;
      let position = msg.payload;
      msg.payload = {
        x: offset.x + position.x,
        y: offset.y + position.y,
        z: offset.z + position.z,
      };

      node.send(msg);
    });
  }

  RED.nodes.registerType('offset', Offset);
};
