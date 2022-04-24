const { wom } = require('maxwhere');
const _ = require('lodash');

// module.exports.saveChanges = function saveChanges(node, mxwNode) {
//   let flows = wom.flowsConfig;
//   let flowsClone = _.cloneDeep(flows);

//   let runtimeNode = flowsClone.find((element) => element.id == node.id);

//   saveMesh(runtimeNode.settings.options, mxwNode);

//   flows = _.merge(flows, flowsClone);
// };
module.exports.saveChanges = function saveChanges(node, mxwNode) {
  let runtimeNode = wom.flowsConfig.flows.find(
    (element) => element.id == node.id,
  );

  saveMesh(runtimeNode.settings.options, mxwNode);
};

module.exports.saveChangesOnHierarchy = function saveChangesOnHierarchy(
  node,
  parentMesh,
) {
  let runtimeNode = wom.flowsConfig.flows.find(
    (element) => element.id == node.id,
  );
  let parent = runtimeNode.parent;

  saveMesh(parent.data.options, parentMesh);

  let getAllChildNodes = (parent, parentMesh) => {
    let directChilds = parent.children;
    let directMeshChilds = parentMesh.children;
    directChilds.forEach((child, index) => {
      let childMesh = directMeshChilds[index];
      if (child.children.length == 0) {
        saveMesh(child.data.options, childMesh);
      } else {
        saveMesh(child.data.options, childMesh);
        getAllChildNodes(child, childMesh);
      }
    });
  };
  getAllChildNodes(parent, parentMesh);
};

// module.exports.saveChangesOnHierarchy = function saveChangesOnHierarchy(
//   node,
//   parentMesh,
// ) {
//   let flows = wom.flowsConfig;
//   let flowsClone = _.cloneDeep(flows);

//   let runtimeNode = flowsClone.find((element) => element.id == node.id);
//   let parent = runtimeNode.parent;

//   saveMesh(parent.data.options, parentMesh);

//   let getAllChildNodes = (parent, parentMesh) => {
//     let directChilds = parent.children;
//     let directMeshChilds = parentMesh.children;
//     directChilds.forEach((child, index) => {
//       let childMesh = directMeshChilds[index];
//       if (child.children.length == 0) {
//         saveMesh(child.data.options, childMesh);
//       } else {
//         saveMesh(child.data.options, childMesh);
//         getAllChildNodes(child, childMesh);
//       }
//     });
//   };
//   getAllChildNodes(parent, parentMesh);

//   flows = _.merge(flows, flowsClone);
// };

function saveMesh(options, mxwNode) {
  let pos = mxwNode.getPosition({ local: true });
  let ori = mxwNode.getOrientation({ local: true });
  let scale = mxwNode.getScale({ local: true });

  options.position = pos;
  options.orientation = ori;
  options.scale = scale;
}
