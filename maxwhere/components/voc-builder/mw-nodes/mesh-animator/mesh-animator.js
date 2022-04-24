const { wom } = require('maxwhere');

module.exports = function (RED) {
  function MeshAnimator(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    node.on('input', (msg) => {
      let settings = config.settings;
      let mesh = wom.select(`#${settings.meshid}`);
      let animator = settings[`${settings.meshid}Animator`];
      if (msg.payload) {
        mesh.animator(animator).start();
      } else {
        mesh.animator(animator).stop();
      }

      msg.payload = `${animator} animaton is set.`;
      node.send(msg);
    });
  }

  RED.nodes.registerType('mesh-animator', MeshAnimator);
};
