const { wom } = require('maxwhere');

module.exports.womAsync = {
  addResources: function addResources(paths, base, done) {
    return new Promise((resolve) => {
      wom.addResources(paths, base, () => {
        if (done) {
          done();
        }

        resolve();
      });
    });
  },
  render: function render(element) {
    return new Promise((resolve) => {
      wom.once(
        {
          type: 'node-create',
          subject: element.id,
        },
        resolve,
      );
      wom.render(element);
    });
  },
};

module.exports.meshAsync = {
  setMaterial: function setMaterial(mesh, material, subvisual) {
    return new Promise((resolve) => {
      mesh.setMaterial(material, subvisual);
      let loop = setInterval(() => {
        if (mesh.subvisual(0)) {
          resolve();
          clearInterval(loop);
        }
      }, 100);
    });
  },
};
