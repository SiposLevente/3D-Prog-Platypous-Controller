const { wom } = require('maxwhere');

module.exports = function (RED) {
  function NodeEventSubscribe(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    let settings = config.settings;

    let mxWNode = wom.select(`#${settings.nodeid}`);

    const sendEvent = function (event) {
      node.send({ payload: event });
    };
    this.recursiveSearchforNode = () => {
      if (mxWNode) {
        mxWNode.on(settings.eventName, sendEvent);
      } else {
        mxWNode = wom.select(`#${settings.nodeid}`);
        setTimeout(this.recursiveSearchforNode, 500);
      }
    };

    this.recursiveSearchforNode();

    node.on('close', () => {
      mxWNode.removeListener(settings.eventName, sendEvent);
    });
  }

  RED.nodes.registerType('node-event-subscribe', NodeEventSubscribe);
};
