const fs = require('fs');
const { wom } = require('maxwhere');

module.exports.getJSON = function getJSON(path) {
  return JSON.parse(fs.readFileSync(path));
};

module.exports.clampNumber = function clampNumber(num, a, b) {
  return Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b));
};

module.exports.createUniqueMaterial = function createUniqueMaterial(node) {
  const material = node.material(node.subvisual(0));
  const materialName = '_' + Math.random().toString(36).substr(2, 9); // random unique name for material
  const clonedMaterial = material.clone(materialName);
  node.setMaterial(materialName);
  return clonedMaterial;
};

module.exports.sleep = function sleep(ms) {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve();
    }, ms),
  );
};
