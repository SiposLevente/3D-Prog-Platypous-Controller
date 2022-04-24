const { wom } = require('maxwhere');
const _ = require('lodash');

module.exports = function (RED) {
  function SetMaterial(config) {
    RED.nodes.createNode(this, config);
    let node = this;
    let settings = config.settings;

    node.on('input', (msg) => {
      let options = _.merge(_.cloneDeep(settings), msg.payload);
      let mxwNode = wom.select(`#${options.meshid}`);
      mxwNode.setMaterial(options.material, parseInt(options.subvisual));

      node.send({ payload: mxwNode });
    });
  }

  RED.nodes.registerType('set-material', SetMaterial);
};
