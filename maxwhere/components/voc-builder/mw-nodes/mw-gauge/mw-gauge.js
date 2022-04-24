const { getJSON } = require('../utils/private/utils');
const path = require('path');
const { Gauge } = require('./gauge');
const { wom } = require('maxwhere');
const { sleep } = require('../utils/private/utils');

module.exports = function (RED) {
  function MwGauge(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    let settings = config.settings;
    let gauge;
    let options;

    if (settings.configType === 'file') {
      options = getJSON(
        path.resolve(__dirname, 'configs', settings.configFile),
      );
    } else if (settings.configType === 'local') {
      options = settings.options;
    }
    gauge = new Gauge(options);

    node.on('input', (msg) => {
      gauge.setNeedleAngleByValue(Number(msg.payload));
    });

    node.on('close', async (done) => {
      await gauge.deregister();
      await sleep(2000);
      console.log('gauge cleared');
      done();
    });
  }

  RED.nodes.registerType('mw-gauge', MwGauge);
};
