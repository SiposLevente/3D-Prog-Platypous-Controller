counter = 1;

mainTopic = "webtest/";

hostname = "broker.emqx.io";
port = 8084;
clientid = "test-client";

client = new Paho.Client(hostname, port, clientid);

var options = {
    timeout: 3,

    //Gets Called if the connection has successfully been established
    onSuccess: function () {
        console.log("Connected!")
    },

    //Gets Called if the connection could not be established
    onFailure: function (message) {
        alert("Connection failed: " + message.errorMessage);
    }
};

client.connect(options);

function handleOrientation(event) {
    document.getElementById("grav_x").innerHTML = "y: " + event.alpha;
    document.getElementById("grav_y").innerHTML = "z: " + event.beta;
    document.getElementById("grav_z").innerHTML = "x: " + event.gamma;
    sendData(event.alpha, "/orientation/y");
    sendData(event.beta, "orientation/z");
    sendData(event.gamma, "orientation/x");
};

function sendData(data, subtopic) {
    var message = new Paho.Message("" + data);
    message.destinationName = mainTopic + "" + subtopic;
    message.qos = 0;
    client.send(message);
}

function incrementCounter() {
    counter += 1;
    var message = new Paho.Message("" + counter);
    message.destinationName = mainTopic;
    message.qos = 0;
    client.send(message);
}

function update_all() {
    incrementCounter();
    document.getElementById("counter_val").innerHTML = counter;
}


window.addEventListener("deviceorientation", handleOrientation);
setInterval(update_all, 10);