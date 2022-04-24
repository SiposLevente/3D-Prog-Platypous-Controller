const { wom } = require('maxwhere');
const { meshAsync } = require('./../utils/private/maxwhereAsync.js');
//TODO create a base Tank class and refactor the whole class
class VerticalTank {
  constructor(config) {
    this.liquidMinVlaue = config.mapping.liquid.min;
    this.liquidMaxValue = config.mapping.liquid.max; // max value for the level indicator
    this.colorMinValue = config.mapping.color.min; // min value for the level indicator
    this.colorMaxValue = config.mapping.color.max; // max value for the color indicator
    this.maxLiquidScale = config.liquid.maxLiquidScale; // max scale for liquid mesh
    this.transparentMaterial = config.transparentMaterial;
    this.mainMaterialName;
    this.transparentMaterialName;

    this.tank = wom.create('mesh', {
      id: config.tank.id,
      class: 'tank',
      url: config.tank.url,
      position: config.tank.position,
      orientation: config.tank.orientation,
      scale: config.tank.scale,
      physical: {
        raycast: true,
      },
      /* autophysical: true, */
      done: async (m) => {
        const clonedMaterial = await this.createUniqueMaterial(m);
        this.mainMaterialName = clonedMaterial.getName();
        await meshAsync.setMaterial(m, config.transparentMaterial);
        //m.setMaterial(config.transparentMaterial);
        // TODO

        const trasparentMaterial = await this.createUniqueMaterial(m);
        this.transparentMaterialName = trasparentMaterial.getName();

        m.addPhysicalShape({
          shape: 'mesh',
          mesh: config.tank.physical.mesh,
        });
      },
    });

    this.liquid = wom.create('mesh', {
      class: 'vtankLiquid',
      url: config.liquid.url,
      position: config.liquid.position,
      orientation: config.liquid.orientation,
      scale: config.liquid.scale,
      done: (m) => {},
    });

    this.tank.appendChild(this.liquid);
    wom.render(this.tank);
  }

  async createUniqueMaterial(m) {
    const mat = m.material(m.subvisual(0));
    const materialName = '_' + Math.random().toString(36).substr(2, 9); // random unique name for material
    const cloneMat = mat.clone(materialName);
    await meshAsync.setMaterial(m, materialName);
    //m.setMaterial(materialName);
    return cloneMat;
  }

  setLevelByValue(newValue) {
    const clampedValue = this.clampNumber(
      newValue,
      this.liquidMinVlaue,
      this.liquidMaxValue,
    );
    this.liquid.setScale(
      this.maxLiquidScale.x,
      this.maxLiquidScale.y,
      ((clampedValue - this.liquidMinVlaue) /
        (this.liquidMaxValue - this.liquidMinVlaue)) *
        this.maxLiquidScale.z,
    );
  }

  setColorByValue(newValue) {
    const meshMaterial = this.tank.material(this.tank.subvisual(0));
    const clampedValue = this.clampNumber(
      newValue,
      this.colorMinValue,
      this.colorMaxValue,
    );
    meshMaterial.setShader(
      'SurfacecolorbiasR',
      (clampedValue - this.colorMinValue) /
        (this.colorMaxValue - this.colorMinValue),
    );
    meshMaterial.setShader(
      'SurfacecolorbiasG',
      1 -
        (clampedValue - this.colorMinValue) /
          (this.colorMaxValue - this.colorMinValue),
    );
  }

  clampNumber(num, a, b) {
    return Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b));
  }

  deregister() {
    return new Promise((resolve) => {
      this.tank.on('deleted', () => {
        resolve();
      });
      this.tank.clear();
    });
  }

  toggleTransparency() {
    let mat = this.tank.material(this.tank.subvisual(0));
    const rShaderValue = mat.shaderValue('SurfacecolorbiasR');
    const gShaderValue = mat.shaderValue('SurfacecolorbiasG');
    const currentMaterialName = mat.getName();
    if (currentMaterialName === this.mainMaterialName) {
      this.tank.setMaterial(this.transparentMaterialName);
    } else {
      this.tank.setMaterial(this.mainMaterialName);
    }
    // TODO
    setTimeout(() => {
      mat = this.tank.material(this.tank.subvisual(0));
      mat.setShader('SurfacecolorbiasR', rShaderValue);
      mat.setShader('SurfacecolorbiasG', gShaderValue);
    }, 1000);
  }
}

module.exports.VerticalTank = VerticalTank;
