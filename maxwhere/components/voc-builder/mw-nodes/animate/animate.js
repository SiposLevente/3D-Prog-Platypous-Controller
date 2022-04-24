const { wom } = require('maxwhere');
const _ = require('lodash');

module.exports = function (RED) {
  function Animate(config) {
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
      switch (settings.attribute) {
        case 'position':
          settings.options.from = settings.options.fromPosition;
          settings.options.to = settings.options.toPosition;
          break;
        case 'scale':
          settings.options.from = settings.options.fromScale;
          settings.options.to = settings.options.toScale;
          break;
        case 'orientation':
          settings.options.from = settings.options.fromOrientation;
          settings.options.to = settings.options.toOrientation;
          break;

        default:
          break;
      }
      settings.options.from = undefined;

      if (settings.mode == 'local') {
        mxWNode.animate(settings.attribute, settings.options, () => {
          node.send({ payload: mxWNode });
        });
      } else if (settings.mode == 'fromInput') {
        let mergedParams = _.merge(settings, msg.payload);
        mxWNode.animate(mergedParams.attribute, mergedParams.options, () => {
          node.send({ payload: mxWNode });
        });
      }

      node.on('close', () => {
        if (mxWNode && mxWNode.animating) {
          mxWNode.deanimate(settings.attribute);
        }
      });
    });
  }

  RED.nodes.registerType('animate', Animate);
};
