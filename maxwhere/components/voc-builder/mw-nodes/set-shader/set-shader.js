const { wom } = require('maxwhere');

module.exports = function (RED) {
  function SetShader(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    node.on('input', (msg) => {
      let settings = config.settings;
      let value;
      if (settings.mode == 'local') {
        value = settings.value;
      } else if (settings.mode == 'fromInput') {
        value = msg.payload;
      }
      const mxWNode = wom.select(`#${settings.nodeid}`);

      const meshMaterial = mxWNode.material(mxWNode.subvisual(0));

      if (settings.reference === 'absolute' && (value >= 0 || value <= 1)) {
        meshMaterial.setShader(settings.shader, value);
      } else if (settings.reference === 'relative') {
        const sumValue = value + meshMaterial.shaderValue(settings.shader);
        if (sumValue < 0) {
          meshMaterial.setShader(settings.shader, 0);
        } else if (sumValue > 1) {
          meshMaterial.setShader(settings.shader, 1);
        } else {
          meshMaterial.setShader(settings.shader, sumValue);
        }
      }

      msg.payload = 'Shader has been set';
      node.send(msg);
    });
  }

  RED.nodes.registerType('set-shader', SetShader);
};
