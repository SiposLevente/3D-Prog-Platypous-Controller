const {
  wom,
  modules: {
    mxwStateProxy: { where },
  },
} = require('maxwhere');
const _ = require('lodash');
const { sleep } = require('../utils/private/utils');
const { over } = require('lodash');

let showOnMenu = (o) => {
  let showOnMenuListener = ({ currentState, nextState }) => {
    // See more: redux observeStore subscribe
    if (nextState === where.menustates.PEBBLES) {
      console.log(
        '<< overlay-controlling-from-component-examples >> Show overlay attached to menumode: PEBBLES!',
      );
      o.show();
    } else if (nextState !== where.menustates.PEBBLES) {
      console.log(
        '<< overlay-controlling-from-component-examples >> Hide overlay attached to menumode: PEBBLES!',
      );
      o.hide();
    }
  };
  return showOnMenuListener;
};

let showOn3D = (o) => {
  let showOn3DListener = ({ currentState, nextState }) => {
    // See more: redux observeStore subscribe
    if (nextState === where.menustates.CROSSHAIR) {
      console.log(
        '<< overlay-controlling-from-component-examples >> Show overlay attached to menumode: CROSSHAIR!',
      );
      o.show();
    } else if (nextState !== where.menustates.CROSSHAIR) {
      console.log(
        '<< overlay-controlling-from-component-examples >> Hide overlay attached to menumode: CROSSHAIR!',
      );
      o.hide();
    }
  };
  return showOn3DListener;
};

module.exports = function (RED) {
  function addOverlay(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    let settings = config.settings;
    Object.assign(settings.options, {
      done: createBehavior(config.settings.behavior),
    });

    if (settings.create == 'init') {
      let overlay = wom.create('webview', settings.options);
      overlay.on('created', () => {
        node.send({ payload: overlay });
      });
      wom.render(overlay);

      node.on('close', async (done) => {
        // if (settings.save && wom.flowsConfig && wom.flowsConfig.saving) {
        //   saveChanges(node, overlay);
        // }
        if (settings.options.physical['link-type'] != 'ghost') {
          overlay.setPhysicalType('ghost');
          await 2000;
        }
        overlay.on('deleted', async () => {
          await sleep(2000);
          console.log(`overlay cleared: id: ${overlay.id}`);

          done();
        });

        overlay.clear();
      });

      node.status({ fill: 'green', shape: 'dot', text: 'Overlay created' });
    } else if (settings.create == 'input') {
      node.status({ fill: 'yellow', shape: 'dot', text: 'Waiting for input' });
      let overlays = [];
      node.on('input', (msg) => {
        let options = _.cloneDeep(settings.options);
        let overlay = wom.create('webview', _.merge(options, msg.payload));
        overlay.on('created', () => {
          node.send({ payload: overlay });
        });
        overlays.push(overlay);
        wom.render(overlay);
        node.status({
          fill: 'blue',
          shape: 'dot',
          text: `${overlays.length} overlay(s) added`,
        });
      });

      node.on('close', async (done) => {
        if (settings.options.physical['link-type'] != 'ghost') {
          overlays.forEach((overlay) => {
            overlay.setPhysicalType('ghost');
          });
          await 2000;
        }

        let deletePromises = [];
        overlays.forEach((overlay) => {
          deletePromises.push(
            new Promise((resolve) => {
              overlay.on('deleted', async () => {
                await sleep(2000);
                console.log(`overlay cleared: id: ${overlay.id}`);
                resolve();
              });
            }),
          );

          overlay.clear();
        });

        await Promise.all(deletePromises);
        node.status({});
        done();
      });
    }
  }

  RED.nodes.registerType('add-overlay', addOverlay);
};

function createBehavior(behavior) {
  let done;
  if (behavior == 'Always on') {
    done = (o) => {
      console.log(
        '<< overlay-controlling-from-component-examples >> Show always visible overlay!',
      );
      o.show();
    };
  } else if (behavior == '3D only') {
    done = (o) => {
      console.log('visible-crosshair done', o);
      let showOn3DListener = showOn3D(o);
      where.on('menu-state-change', showOn3DListener);
      o.on('deleted', () => {
        where.removeListener('menu-state-change', showOn3DListener);
        console.log('Removed listener form overlay 3D');
      });
    };
  } else if (behavior == 'Menu only') {
    done = (o) => {
      let showOnMenuListener = showOnMenu(o);
      where.on('menu-state-change', showOnMenuListener);
      o.on('deleted', () => {
        where.removeListener('menu-state-change', showOnMenuListener);
        console.log('Removed listener form overlay menu');
      });
    };
  }

  return done;
}
