const { wom } = require('maxwhere');
const THREE = require('../utils/private/three.min.js');
const _ = require('lodash');

module.exports = function (RED) {
  function Rotate(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    let settings = config.settings;

    node.on('input', (msg) => {
      let rotateOffset;

      if (settings.oriType == 'quaternion') {
        rotateOffset = new THREE.Quaternion(
          settings.quaternion.x,
          settings.quaternion.y,
          settings.quaternion.z,
          settings.quaternion.w,
        ).normalize();
      } else if (settings.oriType == 'angle-axis') {
        rotateOffset = new THREE.Quaternion();
        rotateOffset
          .setFromAxisAngle(
            new THREE.Vector3(
              settings['angle-axis'].axis.x,
              settings['angle-axis'].axis.y,
              settings['angle-axis'].axis.z,
            ),
            THREE.MathUtils.degToRad(settings['angle-axis'].angle),
          )
          .normalize();
      }

      let ori;
      if (_.has(ori, 'axis')) {
        ori = new THREE.Quaternion();
        ori
          .setFromAxisAngle(
            new THREE.Vector3(
              msg.payload.axis.x,
              msg.payload.axis.y,
              msg.payload.axis.z,
            ),
            THREE.MathUtils.degToRad(msg.payload.angle),
          )
          .normalize();
      } else {
        ori = new THREE.Quaternion(
          msg.payload.x,
          msg.payload.y,
          msg.payload.z,
          msg.payload.w,
        ).normalize();
      }

      let resultQuaternion = new THREE.Quaternion().multiplyQuaternions(
        ori,
        rotateOffset,
      );
      msg.payload = {
        x: resultQuaternion._x,
        y: resultQuaternion._y,
        z: resultQuaternion._z,
        w: resultQuaternion._w,
      };
      node.send(msg);
    });
  }

  RED.nodes.registerType('rotate', Rotate);
};
