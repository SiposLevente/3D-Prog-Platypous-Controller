const { wom } = require('maxwhere');
const _ = require('lodash');
const { sleep } = require('../utils/private/utils');
const { saveChanges } = require('../utils/private/saveChanges');

module.exports = function (RED) {
  function addLight(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    let settings = config.settings;

    if (settings.create == 'init') {
      let light = wom.create('light', settings.options);
      light.on('created', () => {
        node.send({ payload: light });
      });
      wom.render(light);

      node.on('close', async (done) => {
        if (settings.save && wom.flowsConfig && wom.flowsConfig.saving) {
          saveChanges(node, light);
        }
        if (settings.options.physical['link-type'] != 'ghost') {
          light.setPhysicalType('ghost');

          await 2000;
        }
        light.on('deleted', async () => {
          await sleep(2000);
          console.log(`light cleared: id: ${light.id}`);
          done();
        });

        light.clear();
      });

      node.status({ fill: 'green', shape: 'dot', text: 'Light created' });
    } else if (settings.create == 'input') {
      node.status({ fill: 'yellow', shape: 'dot', text: 'Waiting for input' });
      let lights = [];
      node.on('input', (msg) => {
        let options = _.cloneDeep(settings.options);
        let light = wom.create('light', _.merge(options, msg.payload));
        light.on('created', () => {
          node.send({ payload: light });
        });
        lights.push(light);
        wom.render(light);

        node.status({
          fill: 'blue',
          shape: 'dot',
          text: `${lights.length} light(s) added`,
        });
      });
      node.on('close', async (done) => {
        // if link-type is non-ghost than set it to ghost before clearing it because its buggy otherwise
        if (settings.options.physical['link-type'] != 'ghost') {
          lights.forEach((light) => {
            light.setPhysicalType('ghost');
          });
          await 2000;
        }

        let deletePromises = [];
        lights.forEach((light) => {
          deletePromises.push(
            new Promise((resolve) => {
              light.on('deleted', async () => {
                await sleep(2000);
                console.log(`light cleared: id: ${light.id}`);
                resolve();
              });
            }),
          );

          light.clear();
        });

        await Promise.all(deletePromises);
        node.status({});
        done();
      });
    }
  }

  RED.nodes.registerType('add-light', addLight);
};
