const TIMEOUT_VAL = 100;

counter = 1;
userId = uuidv4();
clientId = userId;
hostname = "192.168.1.150";
mainTopic = "controller/";
port = 9001;
alphaOffset = 0;
betaOffset = 0;
gammaOffset = 0;
useTimeout = TIMEOUT_VAL;

inUse = false;
connected = false
capturingData = false;
firstCapture = true;


client = new Paho.Client(hostname, port, clientId);

var options = {
    timeout: 3,

    //Gets Called if the connection has successfully been established
    onSuccess: function () {
        console.log("Connected!")
        connected = true
        client.subscribe(mainTopic + "inUse");
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
        firstCapture = true;
        sendData("released", "inUse");
    }
}

client.onMessageArrived = function (message) {
    if (message.payloadString != userId && message.payloadString != "released") {
        lockController();
    } else if (message.payloadString == "released") {
        releaseController();
    }
}

function lockController() {
    document.getElementById("controller").disabled = true;
    document.getElementById("controller").innerText = "In use!";
    console.log("Other device is using the controller");
    inUse = true;
    useTimeout = TIMEOUT_VAL;
}

function releaseController() {
    console.log("Other device released the controller");
    document.getElementById("controller").disabled = false;
    text = "Take Control"
    if (capturingData) {
        text = "Release"
    }

    document.getElementById("controller").innerText = text;
    inUse = false;
}

function handleOrientation(event) {
    if (connected && capturingData && !inUse) {
        if (firstCapture) {
            firstCapture = false;
            alphaOffset = convertValue(event.alpha);
            betaOffset = -convertValue(event.beta);
            gammaOffset = -convertValue(event.gamma);
        }

        alpha = calculateRealOffset(event.alpha, alphaOffset);
        beta = calculateRealOffset(-event.beta, betaOffset);
        gamma = calculateRealOffset(-event.gamma, gammaOffset);

        document.getElementById("grav_x").innerHTML = "y: " + alpha;
        document.getElementById("grav_y").innerHTML = "z: " + beta;
        document.getElementById("grav_z").innerHTML = "x: " + gamma;

        sendData(userId, "inUse");
        sendData(alpha, "orientation/y");
        sendData(beta, "orientation/z");
        sendData(gamma, "orientation/x");
    }
};

function sendData(data, subtopic) {
    if (data == "released" || (connected && capturingData && !inUse)) {
        var message = new Paho.Message("" + data);
        message.destinationName = mainTopic + "" + subtopic;
        message.qos = 0;
        client.send(message);
    }
}

function incrementCounter() {
    if(useTimeout > 0 && inUse){
        useTimeout--;
    }

    if (useTimeout == 0) {
        releaseController();
    }

    if (connected && capturingData && !inUse) {
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

function convertValue(value) {
    modifiedValue = value % 180;
    if (value > 180) {
        modifiedValue = -180 + modifiedValue;
    }
    return -modifiedValue
}

function calculateRealOffset(realValue, offset) {
    return (convertValue((realValue + offset) % 360)).toFixed(2);
}