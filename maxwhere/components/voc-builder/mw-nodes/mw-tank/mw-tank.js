const fs = require('fs');
const { wom } = require('maxwhere');
const path = require('path');
const { VerticalTank } = require('./verticalTank');
const { HorizontalTank } = require('./horizontalTank');
const { sleep } = require('../utils/private/utils');

module.exports = function (RED) {
  function MwTank(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    let settings = config.settings;

    let tank;
    let tankConfigJSON;
    if (settings.configType === 'file') {
      if (settings.tankTypeFile === 'vertical') {
        this.configFile = path.resolve(
          __dirname,
          'configs',
          'vtank',
          settings.options.verticalTank.configFile,
        );
        const rawdata = fs.readFileSync(this.configFile);
        tankConfigJSON = JSON.parse(rawdata);
        tank = new VerticalTank(tankConfigJSON);
      } else if (settings.tankTypeFile === 'horizontal') {
        this.configFile = path.resolve(
          __dirname,
          'configs',
          'htank',
          settings.options.horizontalTank.configFile,
        );
        const rawdata = fs.readFileSync(this.configFile);
        tankConfigJSON = JSON.parse(rawdata);
        tank = new HorizontalTank(tankConfigJSON);
      }
    } else if (settings.configType === 'local') {
      if (settings.tankTypeLocal === 'vertical') {
        tankConfigJSON = settings.options.verticalTank;
        tank = new VerticalTank(tankConfigJSON);
      } else if (settings.tankTypeLocal === 'horizontal') {
        tankConfigJSON = settings.options.horizontalTank;
        tank = new HorizontalTank(tankConfigJSON);
      }
    }

    node.on('input', (msg) => {
      if (msg.topic === 'setColor') {
        tank.setColorByValue(Number(msg.payload));
      } else if (msg.topic === 'setLevel') {
        tank.setLevelByValue(Number(msg.payload));
      } else if (msg.topic === 'toggleTransparency') {
        tank.toggleTransparency();
      }
    });
    node.on('close', async (done) => {
      await tank.deregister();
      await sleep(2000);
      console.log('tank cleared');
      done();
    });
  }
  RED.nodes.registerType('mw-tank', MwTank);
};
