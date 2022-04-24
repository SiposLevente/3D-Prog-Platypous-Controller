const { wom } = require('maxwhere');
const _ = require('lodash');

module.exports = function (RED) {
  function SetSkybox(config) {
    RED.nodes.createNode(this, config);
    let node = this;
    let settings = config.settings;

    if (settings.create == 'init') {
      wom.setSkyBox({
        enable: true,
        material: settings.material,
        distance: settings.distance,
      });
    } else if (settings.create == 'input') {
      node.on('input', (msg) => {
        let options = _.merge(_.cloneDeep(settings), msg.payload);
        wom.setSkyBox({
          enable: true,
          material: options.material,
          distance: options.distance,
        });
      });
    }
  }

  RED.nodes.registerType('set-skybox', SetSkybox);
};
