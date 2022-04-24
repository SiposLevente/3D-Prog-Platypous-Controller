const { wom } = require('maxwhere');
const _ = require('lodash');
const { saveChangesOnHierarchy } = require('../utils/private/saveChanges');
const { sleep } = require('../utils/private/utils');

module.exports = function (RED) {
  function addMeshHierarchy(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    addPhysicalObjtoAllChildNodes(config.parent);
    if (config.create == 'init') {
      let mesh = renderEveryNode(config.parent);
      mesh.on('created', () => {
        node.send({ payload: mesh });
      });
      wom.render(mesh);

      node.on('close', async (done) => {
        if (config.save && wom.flowsConfig && wom.flowsConfig.saving) {
          saveChangesOnHierarchy(node, mesh);
        }

        if (config.parent.data.options.physical['link-type'] != 'ghost') {
          mesh.setPhysicalType('ghost');

          await 2000;
        }
        mesh.on('deleted', async () => {
          await sleep(2000);
          console.log(`mesh cleared: id: ${mesh.id}`);

          done();
        });

        mesh.clear();
      });
      node.status({ fill: 'green', shape: 'dot', text: 'Mesh created' });
    } else if (config.create == 'input') {
      node.status({ fill: 'yellow', shape: 'dot', text: 'Waiting for input' });
      let meshes = [];
      node.on('input', (msg) => {
        let options = _.cloneDeep(config.parent);
        let mesh = renderEveryNode(_.merge(options, msg.payload));
        mesh.on('created', () => {
          node.send({ payload: mesh });
        });
        meshes.push(mesh);
        wom.render(mesh);

        node.status({
          fill: 'blue',
          shape: 'dot',
          text: `${meshes.length} mesh(es) added`,
        });
      });

      node.on('close', async (done) => {
        if (config.parent.data.options.physical['link-type'] != 'ghost') {
          meshes.forEach((mesh) => {
            mesh.setPhysicalType('ghost');
          });
          await 2000;
        }

        let deletePromises = [];
        meshes.forEach((mesh) => {
          deletePromises.push(
            new Promise((resolve) => {
              mesh.on('deleted', () => {
                console.log(`mesh cleared: id: ${mesh.id}`);
                resolve();
              });
            }),
          );

          mesh.clear();
        });

        await Promise.all(deletePromises);
        node.status({});
        done();
      });
    }
  }

  RED.nodes.registerType('add-mesh-hierarchy', addMeshHierarchy);
};

function renderEveryNode(parent) {
  let parentMesh = wom.create('mesh', parent.data.options);

  let getAllChildNodes = (parent, parentMesh) => {
    let directChilds = parent.children;
    directChilds.forEach((child) => {
      if (child.children.length == 0) {
        let childMesh = wom.create('mesh', child.data.options);
        parentMesh.appendChild(childMesh);
      } else {
        let childMesh = wom.create('mesh', child.data.options);
        parentMesh.appendChild(childMesh);
        getAllChildNodes(child, childMesh);
      }
    });
  };
  getAllChildNodes(parent, parentMesh);

  return parentMesh;
}

function addPhysicalObjtoAllChildNodes(parent) {
  addPhysicalObj(parent.data.options);

  let getAllChildNodes = (parent) => {
    let directChilds = parent.children;
    directChilds.forEach((child) => {
      if (child.children.length == 0) {
        addPhysicalObj(child.data.options);
      } else {
        addPhysicalObj(child.data.options);
        getAllChildNodes(child);
      }
    });
  };
  getAllChildNodes(parent);
}

function addPhysicalObj(options) {
  if (options.physical.phyObj != 'None') {
    options.done = (m) => {
      m.addPhysicalShape({
        shape: 'mesh',
        mesh: options.physical.phyObj,
      });
    };
  }
}
