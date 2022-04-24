const { wom } = require('maxwhere');
const THREE = require('../utils/private/three.min.js');
const _ = require('lodash');

module.exports = function (RED) {
  function SetOrientation(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    let settings = config.settings;

    node.on('input', (msg) => {
      let mxWNode;
      let ori;
      if (settings.nodeid == 'camera') {
        mxWNode = wom.camera;
      } else {
        mxWNode = wom.select(`#${settings.nodeid}`);
      }
      if (settings.mode == 'local') {
        if (settings.oriType == 'quaternion') {
          ori = settings.quaternion;
          normalizeQuaternion(ori);
        } else if (settings.oriType == 'angle-axis') {
          ori = settings['angle-axis'];
          normalizeAxis(ori);
        }
      } else if (settings.mode == 'fromInput') {
        ori = msg.payload;
        if (_.has(ori, 'axis')) {
          normalizeAxis(ori);
        } else {
          normalizeQuaternion(ori);
        }
      }
      mxWNode.setOrientation(ori, settings.reference, settings.space);
      msg.payload = 'Orientation is set';
      node.send(msg);
    });
  }

  RED.nodes.registerType('set-orientation', SetOrientation);
};

function normalizeAxis(ori) {
  let axisVector = new THREE.Vector3(
    ori.axis.x,
    ori.axis.y,
    ori.axis.z,
  ).normalize();
  ori.axis = { x: axisVector.x, y: axisVector.y, z: axisVector.z };
}

function normalizeQuaternion(ori) {
  let quaternion = new THREE.Quaternion(ori.x, ori.y, ori.z, ori.w).normalize();
  ori.axis = {
    w: quaternion.w,
    x: quaternion.x,
    y: quaternion.y,
    z: quaternion.z,
  };
}
