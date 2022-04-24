const { wom } = require('maxwhere');

//TODO create a base Tank class and refactor the whole class

class HorizontalTank {
  constructor(config) {
    this.liquidMinVlaue = config.mapping.liquid.min;
    this.liquidMaxValue = config.mapping.liquid.max; // max value for the level indicator
    this.colorMinValue = config.mapping.color.min; // min value for the level indicator
    this.colorMaxValue = config.mapping.color.max; // max value for the color indicator
    this.resolution = config.liquid.resolution;
    this.transparentMaterialName = config.transparentMaterial;

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
      done: (m) => {
        const clonedMaterial = this.createUniqueMaterial(m);
        this.mainMaterialName = clonedMaterial.getName();

        // TODO
        setTimeout(() => {
          m.setMaterial(config.transparentMaterial);

          setTimeout(() => {
            const trasparentMaterial = this.createUniqueMaterial(m);
            this.transparentMaterialName = trasparentMaterial.getName();
          }, 3000);
        }, 3000);

        m.addPhysicalShape({
          shape: 'mesh',
          mesh: config.tank.physical.mesh,
        });
      },
    });

    this.liquid = [];

    const r = config.tank.radius / config.liquid.buildingBlock.edgeLength;
    const lengthOfBuildingBlock =
      config.tank.length / config.liquid.buildingBlock.edgeLength;
    const zOffset = 0.07;
    for (let index = 1; index < parseInt(this.resolution); index++) {
      // calculate chord length
      const center = this.resolution / 2;
      const distance = center - Math.abs(center - index);
      const h = (distance / this.resolution) * 2 * r;
      const c = Math.sqrt(r * 2 * h - h ** 2) * 2;

      const buildingBlock = wom.create('mesh', {
        url: 'Cube.mesh',
        position: {
          x: 0,
          y: 0,
          z: (1 / this.resolution) * index * 2 * 2 * r + r * zOffset,
        },
        orientation: { w: 1, x: 0, y: 0, z: 0 },
        scale: {
          x: lengthOfBuildingBlock,
          y: c,
          z: (1 / this.resolution) * 2 * r,
        },
        done: (m) => {
          m.addPhysicalShape({
            shape: 'mesh',
            mesh: 'Cube.mesh_phy.obj',
            mass: 1.0,
          });
          // m.setMaterial("Uveg_1")
          // let clonedMaterial = this.createUniqueMaterial(m);

          // clonedMaterial.setDepthFeatures(true, false);
        },
      });
      this.liquid.push(buildingBlock);
      this.tank.appendChild(buildingBlock);
    }

    wom.render(this.tank);
  }

  createUniqueMaterial(m) {
    const mat = m.material(m.subvisual(0));
    const materialName = '_' + Math.random().toString(36).substr(2, 9); // random unique name for material
    const cloneMat = mat.clone(materialName);
    m.setMaterial(materialName);
    return cloneMat;
  }

  setLevelByValue(newValue) {
    const clampedValue = this.clampNumber(
      newValue,
      this.liquidMaxValue,
      this.liquidMinVlaue,
    );
    const level = Math.round(
      ((clampedValue - this.liquidMinVlaue) /
        (this.liquidMaxValue - this.liquidMinVlaue)) *
        this.resolution,
    );
    for (let index = 0; index < this.liquid.length; index++) {
      index + 1 > level ? this.liquid[index].hide() : this.liquid[index].show();
    }
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

module.exports.HorizontalTank = HorizontalTank;
