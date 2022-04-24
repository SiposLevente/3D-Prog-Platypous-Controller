const { wom } = require('maxwhere');
const { saveChanges } = require('../utils/private/saveChanges');
const _ = require('lodash');
const { sleep } = require('../utils/private/utils');

module.exports = function (RED) {
  function addMesh(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    let settings = config.settings;
    addPhysicalObj(settings.options);

    if (settings.create == 'init') {
      //console.log('mesh created');
      let mesh = wom.create('mesh', settings.options);
      mesh.on('created', () => {
        node.send({ payload: mesh });
      });
      wom.render(mesh);

      node.on('close', async (done) => {
        if (settings.save && wom.flowsConfig && wom.flowsConfig.saving) {
          saveChanges(node, mesh);
        }
        // if link-type is non-ghost than set it to ghost before clearing it because its buggy otherwise
        if (settings.options.physical['link-type'] != 'ghost') {
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
    } else if (settings.create == 'input') {
      let meshes = [];
      node.status({ fill: 'yellow', shape: 'dot', text: 'Waiting for input' });
      node.on('input', (msg) => {
        let options = _.cloneDeep(settings.options);
        let mesh = wom.create('mesh', _.merge(options, msg.payload));
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
        // if link-type is non-ghost than set it to ghost before clearing it because its buggy otherwise
        if (settings.options.physical['link-type'] != 'ghost') {
          meshes.forEach((mesh) => {
            mesh.setPhysicalType('ghost');
          });
          await 2000;
        }

        let deletePromises = [];
        meshes.forEach((mesh) => {
          deletePromises.push(
            new Promise((resolve) => {
              mesh.on('deleted', async () => {
                await sleep(2000);

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

  RED.nodes.registerType('add-mesh', addMesh);
};
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
