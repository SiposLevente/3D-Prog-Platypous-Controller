const http = require('http');
const express = require('express');
const RED = require('node-red');
const path = require('path');
const { wom } = require('maxwhere');
const fs = require('fs');
const _ = require('lodash');

let firstStart = true;
let restartRunning = false;

async function saveHandler(event) {
  if (
    event.keyName == 'S' &&
    event.modCtrl &&
    !restartRunning &&
    event.type == 'keyDown'
  ) {
    restartRunning = true;
    await save();
    await RED.nodes.startFlows();
    restartRunning = false;
  }
}
async function save() {
  wom.flowsConfig = {
    saving: true,
    flows: RED.nodes.getFlows().flows,
  };
  await RED.nodes.stopFlows();

  await RED.nodes.setFlows(
    wom.flowsConfig.flows,
    null,
    'full',
    true,
    null,
    null,
  );

  wom.flowsConfig.saving = false;
}
module.exports.init = function init(options) {
  if (firstStart) {
    initServer(options);
    wom.on('input-keyboard', saveHandler);
  } else {
    RED.nodes.startFlows();
  }
};

module.exports.clear = function clear() {
  save();
};

function initServer(options) {
  // Create an Express app
  const app = express();

  firstStart = true;

  // Add a simple route for static content served from 'public'
  app.use(
    '/',
    express.static(path.resolve(__dirname, 'mw-nodes/utils/static')),
  );

  // Create a server
  const server = http.createServer(app);

  const settings = {
    httpAdminRoot: '/red',
    httpNodeRoot: '/api',
    userDir: path.resolve(__dirname, options.userDir),
    functionGlobalContext: { wom },
    flowFile: path.resolve(__dirname, options.flowFile),
    paletteCategories: ['MaxWhere'],
    editorTheme: {
      codeEditor: {
        lib: 'monaco',
      },
      page: {
        title: 'VOC - Builder',
        //favicon: '/absolute/path/to/theme/icon',
        css: path.resolve(
          __dirname,
          'mw-nodes/utils/public/vendor/json-form/deps/opt/bootstrap.css',
        ),

        scripts: [
          path.resolve(
            __dirname,
            'mw-nodes/utils/public/vendor/json-form/deps/underscore.js',
          ),
          path.resolve(
            __dirname,
            'mw-nodes/utils/public/vendor/json-form/deps/opt/jsv.js',
          ),
          path.resolve(
            __dirname,
            'mw-nodes/utils/public/vendor/json-form/lib/jsonform.js',
          ),

          path.resolve(
            __dirname,
            'mw-nodes/utils/public/vendor/jstree/jstree.js',
          ),

          path.resolve(
            __dirname,
            'mw-nodes/utils/public/vendor/three/three.min.js',
          ),
          path.resolve(
            __dirname,
            'mw-nodes/utils/public/vendor/json-form/deps/opt/spectrum.js',
          ),
        ],
      },
      header: {
        title: 'VOC - Builder',
        image: path.resolve(__dirname, 'voc-builder-logo.png'),
      },
    },
  };
  // Initialise the runtime with a server and settings
  RED.init(server, settings);
  RED.events.emit();
  //add api endpoint to utils folder
  RED.httpAdmin.get('/utils/*', function (req, res) {
    var options = {
      root: path.resolve(__dirname, 'mw-nodes/utils/'),
      dotfiles: 'deny',
    };
    res.sendFile(req.params[0], options);
  });

  RED.httpAdmin.get('/getMeshNames/', (req, res) => {
    let resourceKeys = Object.keys(wom.resourcePaths);
    let files = [];
    resourceKeys.forEach((key) => {
      files.push(...wom.getResourceFileList(key));
    });

    let meshFiles = files.filter((el) => /\.mesh$/.test(el));
    // loop through each directory

    res.send(meshFiles);
  });

  RED.httpAdmin.get('/getPhyObjectNames/', (req, res) => {
    let resourceKeys = Object.keys(wom.resourcePaths);
    let files = [];
    resourceKeys.forEach((key) => {
      files.push(...wom.getResourceFileList(key));
    });

    let phyobjFiles = files.filter((el) => /\.mesh_phy.obj$/.test(el));
    // loop through each directory

    res.send(phyobjFiles);
  });

  RED.httpAdmin.get('/getGaugeConfigs/', (req, res) => {
    fs.readdir(
      path.resolve(__dirname, 'mw-nodes', 'mw-gauge', 'configs'),
      (err, files) => {
        let gaugeConfigFiles = files.filter((el) => /\.json$/.test(el));
        // loop through each directory

        res.send(gaugeConfigFiles);
      },
    );
  });

  RED.httpAdmin.get('/getVerticalTankConfigs/', (req, res) => {
    fs.readdir(
      path.resolve(__dirname, 'mw-nodes', 'mw-tank', 'configs', 'vtank'),
      (err, files) => {
        let tankConfigFiles = files.filter((el) => /\.json$/.test(el));
        // loop through each directory

        res.send(tankConfigFiles);
      },
    );
  });
  RED.httpAdmin.get('/getHorizontalTankConfigs/', (req, res) => {
    fs.readdir(
      path.resolve(__dirname, 'mw-nodes', 'mw-tank', 'configs', 'htank'),
      (err, files) => {
        let tankConfigFiles = files.filter((el) => /\.json$/.test(el));
        // loop through each directory

        res.send(tankConfigFiles);
      },
    );
  });

  RED.httpAdmin.get('/getWomIds/', (req, res) => {
    let mwNodes = getMwNodes();
    let ids = mwNodes.map((node) => node.id);
    res.send(ids);
  });
  RED.httpAdmin.get('/getMeshIds/', (req, res) => {
    let mwMeshes = wom.selectAll('mesh').filter((children) => {
      return children.id && children.id.length != 32;
    });
    let ids = mwMeshes.map((node) => node.id);
    res.send(ids);
  });
  RED.httpAdmin.get('/getAnimators/', (req, res) => {
    let mwMeshes = wom.selectAll('mesh').filter((mesh) => {
      return mesh.id && mesh.id.length != 32;
    });
    let animatorsOfMeshes = mwMeshes
      .filter((mesh) => mesh.animatorNames().length != 0)
      .map((mesh) => {
        return { id: mesh.id, animators: mesh.animatorNames() };
      });

    res.send(animatorsOfMeshes);
  });

  RED.httpAdmin.get('/getSubvisualNum/', (req, res) => {
    let mesh = wom.select(`#${req.query.id}`);
    let subvisualNum = mesh.subvisuals().length;

    res.send([subvisualNum]);
  });

  RED.httpAdmin.get('/getMaterialNames/', (req, res) => {
    let materials = [];
    for (const [key, value] of Object.entries(
      wom.getAvailableMaterialNames(),
    )) {
      materials = materials.concat(
        value.filter((material) => !material.toLowerCase().includes('skybox')),
      );
    }

    res.send(materials);
  });

  RED.httpAdmin.get('/getSkyBoxNames/', (req, res) => {
    let materials = [];
    for (const [key, value] of Object.entries(
      wom.getAvailableMaterialNames(),
    )) {
      materials = materials.concat(
        value.filter((material) => material.toLowerCase().includes('skybox')),
      );
    }

    res.send(materials);
  });

  RED.httpAdmin.put('/putTest/', (req, res) => {
    console.log(req);
  });

  // Serve the editor UI from /red
  app.use(settings.httpAdminRoot, RED.httpAdmin);

  // Serve the http nodes UI from /api
  app.use(settings.httpNodeRoot, RED.httpNode);

  server.listen(8000);
  RED.start().then(() => {
    firstStart = false;
  });
}

function getMwNodes() {
  let toRemove = [
    'operations',
    'logo',
    'infoscreen',
    'menu',
    'gizmo-overlay',
    'mxw-webtable-permanent',
    'mxw-zoom-overlay',
    'mxw-message',
    'mxw-tooltip-bar',
    'mxw-status-bar',
    'mxw-auth-overlay',
    'mxw-navigation-bar',
  ];
  let ids = wom.selectAll('*').filter((children) => {
    return (
      children.id && children.id.length != 32 && !toRemove.includes(children.id)
    );
  });
  return ids;
}
