/* Copyright (C) 2015-2019 MISTEMS Ltd. - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
const { wom } = require('maxwhere');
const { womAsync } = require('./mw-nodes/utils/private/maxwhereAsync.js');

const path = require('path');

const REDServer = require('./nodeRedServer');

const init = function (options) {};

const done = function () {};

const render = function (options) {
  startServer(options);

  return <node />;
};

const clear = function () {
  REDServer.clear();
};

async function startServer(options) {
  await womAsync.addResources(path.resolve(__dirname, options.resources));
  REDServer.init(options);
}

// these exported function will be called by MaxWhere
module.exports = {
  init,
  done,
  render,
  clear,
};
