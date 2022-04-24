const { clampNumber, createUniqueMaterial } = require('../utils/private/utils');
const { wom } = require('maxwhere');
const { BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

class Gauge {
  constructor(config) {
    this.minAngle = config.mapping.minAngle;
    this.maxAngle = config.mapping.maxAngle;
    this.minValue = config.mapping.minValue;
    this.maxValue = config.mapping.maxValue;
    this.rotationAxis = config.needle.axis;

    let textureConfig = this.getTextureConfig(config);

    this.body = this.createBody(config);
    this.dial = this.createDial(config, textureConfig);
    this.needle = this.createNeedle(config);
    this.dial.appendChild(this.needle);
    this.body.appendChild(this.dial);
    wom.render(this.body);

    // set angle to minValue at the beginning  TODO
    this.needle.setOrientation(
      { angle: this.minAngle - 47, axis: config.needle.axis },
      'absolute',
      'parent',
    );
  }

  // sets angle by value
  setNeedleAngleByValue(newValue) {
    const calculatedAngle =
      ((newValue - this.minValue) / (this.maxValue - this.minValue)) *
        (this.maxAngle - this.minAngle) +
      this.minAngle;

    const angle = clampNumber(calculatedAngle, this.minAngle, this.maxAngle);

    this.needle.setOrientation(
      { angle: angle - 47, axis: this.rotationAxis },
      'absolute',
      'parent',
    );
  }

  createBody(config) {
    return wom.create('mesh', {
      id: config.body.id,
      class: 'gauge',
      url: config.body.url,
      position: config.body.position,
      orientation: config.body.orientation,
      scale: config.body.scale,

      physical: {
        raycast: true,
      },
      done: (m) => {
        m.addPhysicalShape({
          shape: 'mesh',
          mesh: config.body.physical.mesh,
        });
      },
    });
  }

  createDial(config, textureConfig) {
    return wom.create('mesh', {
      url: config.dial.url,
      position: config.dial.position,
      orientation: config.dial.orientation,
      scale: config.dial.scale,
      done: (m) => {
        const clonedMaterial = createUniqueMaterial(m);

        createDialTexture(textureConfig, clonedMaterial);

        m.addPhysicalShape({
          shape: 'mesh',
          mesh: config.dial.physical.mesh,
        });
      },
    });
  }

  createNeedle(config) {
    return wom.create('mesh', {
      url: config.needle.url,
      position: config.needle.position,
      orientation: config.needle.orientation,
      scale: config.needle.scale,
      done: (m) => {
        m.addPhysicalShape({
          shape: 'mesh',
          mesh: config.needle.physical.mesh,
        });
      },
    });
  }

  getTextureConfig(config) {
    return {
      imageFilename: `${config.body.id}DialTexture.png`,
      width: config.dial.texture.width,
      height: config.dial.texture.height,
      units: config.dial.texture.units,
      minValue: config.mapping.minValue,
      maxValue: config.mapping.maxValue,
      majorTicks: (() => {
        let majorTicks = config.dial.texture.majorTicks;
        if (_.isObject(majorTicks[0])) {
          majorTicks = majorTicks.map((x) => x.value);
        }
        return majorTicks;
      })(),
      highlights: config.dial.texture.highlights,
      startAngle: config.mapping.minAngle,
      ticksAngle: config.mapping.maxAngle - config.mapping.minAngle,
    };
  }

  deregister() {
    return new Promise((resolve) => {
      this.body.on('deleted', () => {
        resolve();
      });
      this.body.clear();
    });
  }
}
//TODO
function createDialTexture(options, material) {
  let gaugeFactoryWindow = new BrowserWindow({
    width: options.width + 150,
    height: options.height + 150,
    show: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  ipcMain.once(options.imageFilename, (event, options) => {
    gaugeFactoryWindow
      .capturePage({
        x: 0,
        y: 0,
        width: options.width,
        height: options.height,
      })
      .then((nativeimage) => {
        let img = nativeimage.toPNG();
        fs.writeFile(
          path.resolve(
            wom.resourcePaths[Object.keys(wom.resourcePaths)[0]][0],
            options.imageFilename,
          ),
          img,
          function (err) {
            if (err) throw err;
            console.log('File is created successfully.');
            material.setShader('Diffusemap', options.imageFilename);
            gaugeFactoryWindow.close();
          },
        );
      });
  });
  gaugeFactoryWindow
    .loadURL(
      path.resolve(__dirname, 'gaugeTexture', 'gaugeTextureFactory.html'),
    )
    .then(() => {
      gaugeFactoryWindow.webContents.send('gaugeTextureInit', options);
    });
}

module.exports.Gauge = Gauge;
