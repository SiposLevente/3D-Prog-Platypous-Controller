counter = 1;

mainTopic = "webtest/";
connected = false
hostname = "192.168.1.150";
port = 9001;
clientId = "test-client";
in_use = false;
capturingData = false;
userId = uuidv4();

client = new Paho.Client(hostname, port, clientId);

var options = {
    timeout: 3,

    //Gets Called if the connection has successfully been established
    onSuccess: function () {
        console.log("Connected!")
        connected = true
        client.subscribe(mainTopic + "in_use");
    },
    //Gets Called if the connection could not be established
    onFailure: function (message) {
        alert("Connection failed: " + message.errorMessage);
    }
};

client.connect(options);


window.addEventListener("deviceorientation", handleOrientation);
setInterval(update_all, 10);

function buttonPressed() {
    capturingData = !capturingData
    if (capturingData) {
        document.getElementById("controller").innerText = "Release";
    } else {
        document.getElementById("controller").innerText = "Take Control";
        sendData("released", "in_use");
    }
}

client.onMessageArrived = function (message) {
    if (message.payloadString != userId && message.payloadString != "released") {
        document.getElementById("controller").disabled = true;
        document.getElementById("controller").innerText = "In use!";
        console.log("Other device is using the controller");
        in_use = true;
    } else if (message.payloadString == "released") {
        console.log("Other device released the controller");
        document.getElementById("controller").disabled = false;
        text = "Take Control"
        if (capturingData) {
            text = "Release"
        }

        document.getElementById("controller").innerText = text;
        in_use = false;
    }
}

function handleOrientation(event) {
    if (connected && capturingData && !in_use) {
        alpha = (event.alpha).toFixed(2);
        beta = (event.beta).toFixed(2);
        gamma = (event.gamma).toFixed(2);
        document.getElementById("grav_x").innerHTML = "y: " + alpha;
        document.getElementById("grav_y").innerHTML = "z: " + beta;
        document.getElementById("grav_z").innerHTML = "x: " + gamma;
        sendData(userId, "in_use");
        sendData(alpha, "orientation/y");
        sendData(beta, "orientation/z");
        sendData(gamma, "orientation/x");
    }
};

function sendData(data, subtopic) {
    if (data == "released" || (connected && capturingData && !in_use)) {
        var message = new Paho.Message("" + data);
        message.destinationName = mainTopic + "" + subtopic;
        message.qos = 0;
        client.send(message);
    }
}

function incrementCounter() {
    if (connected && capturingData && !in_use) {
        counter += 1;
        sendData(counter, "counter")
    }
}

function update_all() {
    incrementCounter();
    document.getElementById("counter_val").innerHTML = counter;
}

function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}