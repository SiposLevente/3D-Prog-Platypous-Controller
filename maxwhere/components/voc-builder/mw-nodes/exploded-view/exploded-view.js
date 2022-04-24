const { wom } = require('maxwhere');
const {
  Vector3,
  Box3,
  Matrix4,
  Quaternion,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
} = require('../utils/private/three.min.js');

module.exports = function (RED) {
  function explodedView(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    const mxWNode = wom.select(`#${config.nodeid}`);
    let isExploded = false;
    let parts = getAllParts(mxWNode);
    let originalPositions;

    node.on('input', (msg) => {
      if (!isExploded) {
        originalPositions = getPositions(parts);
      }

      explode(
        parts,
        originalPositions,
        isExploded,
        Number(config.displacementFactor),
      );
      isExploded = !isExploded;
      msg.payload = mxWNode;
      node.send(msg);
    });

    node.on('close', () => {
      setPositions(parts, originalPositions);
    });
  }

  RED.nodes.registerType('exploded-view', explodedView);
};

function explode(parts, originalPositions, isExploded, displacementFactor) {
  if (isExploded) {
    setPositions(parts, originalPositions);
  } else {
    // center is the parent noded
    let center = originalPositions[0];

    //let box3Array = [];
    let calculatedPositionsArray = [];

    for (let index = 0; index < parts.length; index++) {
      const element = parts[index];
      const pos = originalPositions[index];
      let calculatedPosition = calculatePosition(
        pos,
        displacementFactor,
        center,
      );

      calculatedPositionsArray.push(calculatedPosition);

      //box3Array.push(getBoundingBox(element, calculatedPosition));

      element.animate('position', {
        to: calculatedPosition,
        duration: 3,
        space: 'world',
        reference: 'absolute',
      });
    }

    /* let intersectArray = [];
    for (let i = 0; i < box3Array.length; i++) {
      const elementX = box3Array[i];
      intersectArray.push([]);

      for (let j = 0; j < box3Array.length; j++) {
        const elementY = box3Array[j];
        if (elementX.intersectsBox(elementY)) {
          if (i != j) {
            intersectArray[i].push(j);
          }
        }
      }
    } */
  }
}

function calculatePosition(pos, displacementFactor, center) {
  let dir = new Vector3();
  let direction = dir.subVectors(pos, center).normalize();
  let calculatedPosition = {
    x: pos.x + direction.x * displacementFactor,
    y: pos.y + direction.y * displacementFactor,
    z: pos.z + direction.z * displacementFactor,
  };
  return calculatedPosition;
}

function setPositions(parts, positions) {
  if (positions) {
    for (let index = 0; index < parts.length; index++) {
      const element = parts[index];
      const pos = positions[index];

      element.animate('position', {
        to: {
          x: pos.x,
          y: pos.y,
          z: pos.z,
        },
        duration: 3,
        space: 'world',
        reference: 'absolute',
      });
    }
  }
}

function getPositions(parts) {
  return parts.map((part) => {
    let pos = part.getPosition();
    let vector = new Vector3(pos.x, pos.y, pos.z);
    console.log('Original positions');
    console.log(`${part.url}`, vector);
    return vector;
  });
}

function getAllParts(parent) {
  let objectArray = [];
  objectArray.push(parent);

  let getAllChildNodes = (parent) => {
    let directChilds = parent.children;
    directChilds.forEach((child) => {
      if (child.children.length == 0) {
        objectArray.push(child);
      } else {
        objectArray.push(child);
        getAllChildNodes(child);
      }
    });
  };
  getAllChildNodes(parent);

  return objectArray;
}

// TODO bounding boxes are matching, but calculated intersections are not
let getBoundingBox = (element, calculatedPosition) => {
  let scale = element.node.GetDerivedScale();
  let vector3Scale = new Vector3(scale.x, scale.y, scale.z);

  let orientation = element.node.GetDerivedOrientation();
  let quaternionOrientation = new Quaternion(
    orientation.x,
    orientation.y,
    orientation.z,
    orientation.w,
  );
  let aabbcenter = element.entity.GetAABB().center;
  let vector3aabbcenter = new Vector3(aabbcenter.x, aabbcenter.y, aabbcenter.z);
  vector3aabbcenter.applyQuaternion(quaternionOrientation);
  let vector3Position = new Vector3(
    vector3aabbcenter.x * vector3Scale.x + calculatedPosition.x,
    vector3aabbcenter.y * vector3Scale.y + calculatedPosition.y,
    vector3aabbcenter.z * vector3Scale.z + calculatedPosition.z,
  );
  let aabbsize = element.entity.GetAABB().size;
  let vector3aabbsize = new Vector3(aabbsize.x, aabbsize.y, aabbsize.z);
  /* let matrix4Obj = new Matrix4();
  matrix4Obj.compose(vector3Position, quaternionOrientation, vector3Scale);

  let box3Obj = new Box3();
  box3Obj.setFromCenterAndSize(vector3aabbcenter, vector3aabbsize);
  box3Obj.applyMatrix4(matrix4Obj); */

  const geometry = new BoxGeometry(1, 1, 1);
  const material = new MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new Mesh(geometry, material);

  cube.position.set(
    vector3aabbcenter.x * vector3Scale.x + calculatedPosition.x,
    vector3aabbcenter.y * vector3Scale.y + calculatedPosition.y,
    vector3aabbcenter.z * vector3Scale.z + calculatedPosition.z,
  );
  cube.quaternion.set(
    orientation.x,
    orientation.y,
    orientation.z,
    orientation.w,
  );
  cube.scale.set(
    vector3aabbsize.x * vector3Scale.x,
    vector3aabbsize.y * vector3Scale.y,
    vector3aabbsize.z * vector3Scale.z,
  );

  let unit_cube = wom.create('mesh', {
    url: 'unit_cube_bevel.mesh',
    position: {
      x: vector3aabbcenter.x * vector3Scale.x + calculatedPosition.x,
      y: vector3aabbcenter.y * vector3Scale.y + calculatedPosition.y,
      z: vector3aabbcenter.z * vector3Scale.z + calculatedPosition.z,
    },
    autophysical: true,
    scale: {
      x: vector3aabbsize.x * vector3Scale.x,
      y: vector3aabbsize.y * vector3Scale.y,
      z: vector3aabbsize.z * vector3Scale.z,
    },
    orientation: orientation,
  });
  wom.render(unit_cube);

  //return box3Obj;
  return cube;
};
