/* Copyright (C) 2015-2019 MISTEMS Ltd. - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */

import { wom, context, modules, Mesh, Node } from 'maxwhere';
import { womAsync } from '@mxw/next';

import { ipcMain } from 'electron';

module.exports.init = function () { };

module.exports.done = function (nodeReturnedByRenderFunction: Node) { };

module.exports.render = function (options: object): any {
  initAsync();
  return wom.create('node', {});
};

module.exports.clear = function () { };

async function initAsync() {
  let pengu = wom.create('mesh', {
    url: 'penguin.mesh',
    id: 'pengu',
    class: 'animal',
    scale: 10,
    position: { x: 10, y: 250, z: 10 },
    autophysical: true,
    done: (m) => {
      console.log('DONE');
      m.addListener('click', (e) => {
        console.log('clicked');
        console.log(e);
        pengu.setPosition([10, 0, 0], 'relative', 'local');
      })
    }
  });

  await womAsync.render(pengu);
}
