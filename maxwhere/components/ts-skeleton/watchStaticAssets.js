const path = require('path');
const chokidar = require('chokidar');
const fse = require('fs-extra');

// addWatcher(
//   path.resolve(__dirname, 'src/wom-nodes/truckResources'),
//   path.resolve(__dirname, 'mwdist/wom-nodes/truckResources'),
// );
// addWatcher(
//   path.resolve(__dirname, 'src/wom-nodes/unitCubeResources'),
//   path.resolve(__dirname, 'mwdist/wom-nodes/unitCubeResources'),
// );
// addWatcher(
//   path.resolve(__dirname, 'src/wom-nodes/webcontents'),
//   path.resolve(__dirname, 'mwdist/wom-nodes/webcontents'),
// );

function addWatcher(srcPath, distPath) {
  chokidar
    .watch(srcPath)
    .on('add', (srcFilePath) => {
      let relativePath = path.relative(srcPath, srcFilePath);
      fse.copy(
        path.resolve(__dirname, srcFilePath),
        path.resolve(__dirname, distPath, relativePath),
      );
    })
    .on('change', (srcFilePath) => {
      let relativePath = path.relative(srcPath, srcFilePath);
      fse.copy(
        path.resolve(__dirname, srcFilePath),
        path.resolve(__dirname, distPath, relativePath),
      );
    })
    .on('unlink', (srcFilePath) => {
      let relativePath = path.relative(srcPath, srcFilePath);
      fse.remove(path.resolve(__dirname, distPath, relativePath));
    });
}
