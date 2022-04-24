const { wom } = require('maxwhere');

module.exports = function (RED) {
  function WomEventSubscribe(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    let settings = config.settings;
    const sendEvent = function (event) {
      node.send({ payload: event });
    };
    let subject;
    if (settings.subject == 'none') {
      subject = '';
    } else if (settings.subject == 'camera') {
      subject = wom.camera;
    } else {
      subject = wom.select(`#${settings.subject}`);
    }
    /* let object;
    if (settings.object == 'none') {
      object = '';
    } else if (settings.object == 'camera') {
      object = wom.camera;
    } else {
      object = wom.select(`#${settings.subject}`);
    } */
    let eventName = {
      type: settings.eventName,
    };
    if (subject) {
      eventName.subject = subject.node.GetName();
    }
    /* if (object) {
      eventName.object = object.physical;
    } */
    wom.on(eventName, sendEvent);

    node.on('close', () => {
      wom.removeListener(eventName, sendEvent);
    });
  }

  RED.nodes.registerType('wom-event-subscribe', WomEventSubscribe);
};
