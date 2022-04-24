const { wom } = require('maxwhere');
const { saveChanges } = require('../utils/private/saveChanges');
const _ = require('lodash');
const { sleep } = require('../utils/private/utils');

module.exports = function (RED) {
  function addWebtable(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    let settings = config.settings;

    if (settings.create == 'init') {
      let webTable = wom.create('webtable', settings.options);
      webTable.webview.on('created', () => {
        node.send({ payload: webTable });
      });
      wom.render(webTable);

      node.on('close', async (done) => {
        if (settings.save && wom.flowsConfig && wom.flowsConfig.saving) {
          saveChanges(node, webTable.webview);
        }
        if (settings.options.physical['link-type'] != 'ghost') {
          webTable.webview.setPhysicalType('ghost');

          await 2000;
        }

        webTable.webview.on('deleted', async () => {
          await sleep(2000);
          console.log(`webtable cleared: id: ${webTable.id}`);

          done();
        });
        webTable.clear();
      });
      node.status({ fill: 'green', shape: 'dot', text: 'Webtable created' });
    } else if (settings.create == 'input') {
      node.status({ fill: 'yellow', shape: 'dot', text: 'Waiting for input' });
      let webTables = [];
      node.on('input', (msg) => {
        let options = _.cloneDeep(settings.options);
        let webTable = wom.create('webtable', _.merge(options, msg.payload));
        webTable.webview.on('created', () => {
          node.send({ payload: webview });
        });
        webTables.push(webTable);
        wom.render(webTable);
        node.status({
          fill: 'blue',
          shape: 'dot',
          text: `${webTables.length} webtable(s) added`,
        });
      });

      node.on('close', async (done) => {
        if (settings.options.physical['link-type'] != 'ghost') {
          webTables.forEach((webTable) => {
            webTable.webview.setPhysicalType('ghost');
          });
          await 2000;
        }

        let deletePromises = [];
        webTables.forEach((webTable) => {
          deletePromises.push(
            new Promise((resolve) => {
              webTable.webview.on('deleted', async () => {
                await sleep(2000);
                console.log(`webtable cleared: id: ${webTable.id}`);
                resolve();
              });
            }),
          );

          webTable.clear();
        });

        await Promise.all(deletePromises);
        node.status({});
        done();
      });
    }
  }

  RED.nodes.registerType('add-webtable', addWebtable);
};
