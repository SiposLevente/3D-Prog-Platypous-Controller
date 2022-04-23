// MQTT release publish text
const RELEASE_TEXT = "released"

// MQTT topics
const mainTopic = "controller/";
const useTopic = "inUse";
const xTopic = "orietation/x";
const yTopic = "orietation/y";
const zTopic = "orietation/z";


// MQTT connection settings
const hostname = "192.168.1.150";
const port = 9001;
const useSSL = false;
const username = "";
const password = "";
const path = "/ws";

// HTML id names:
const dotId = "dot";
const controllerButtonId = "controller";
const centerButtonId = "center_button";
const controllerBorderId = "controll_border";

// Website variables
const TIMEOUT_VAL = 100;
const userId = uuidv4();
counter = 1;
alphaOffset = 0;
betaOffset = 0;
gammaOffset = 0;
useTimeout = TIMEOUT_VAL;

inUse = false;
connected = false
capturingData = false;
resetOffset = true;

client = new Paho.Client(hostname, port, path, userId);

var options = {
    timeout: 3,

    //Gets Called if the connection has successfully been established
    onSuccess: function () {
        console.log("Connected!")
        connected = true
        client.subscribe(mainTopic + useTopic)
    },
    userName: username,
    password: password,
    useSSL: useSSL,
    //Gets Called if the connection could not be established
    onFailure: function (message) {
        alert("Connection failed: " + message.errorMessage);
    }
};

 // MQTT tries to connect to specified broker
client.connect(options);

// Orientation event
window.addEventListener("deviceorientation", handleOrientation);

// Ticks every 10ms
setInterval(incrementCounter, 10); 

function controllButtonPressed() {
    capturingData = !capturingData
    if (capturingData) {
        document.getElementById(controllerButtonId).innerText = "Release";
        changeControllerDotVisibility(true);
    } else {
        document.getElementById(controllerButtonId).innerText = "Take Control";
        resetOffset = true;
        changeControllerDotVisibility(false);
        sendData(RELEASE_TEXT, useTopic);
    }
}

function centerDot() {
    resetOffset = true;
}

// Message arrives on a subscribed topic
client.onMessageArrived = function (message) {
    if (message.payloadString != userId && message.payloadString != RELEASE_TEXT) {
        lockController();
    } else if (message.payloadString == RELEASE_TEXT) {
        releaseController();
    }
}

function lockController() {
    document.getElementById(dotId).style.backgroundColor = "grey";
    document.getElementById(controllerButtonId).disabled = true;
    document.getElementById(centerButtonId).disabled = true;
    document.getElementById(controllerButtonId).innerText = "In use!";
    console.log("Other device is using the controller");
    inUse = true;
    useTimeout = TIMEOUT_VAL;
}

function releaseController() {
    console.log("Other device released the controller");
    document.getElementById(dotId).style.backgroundColor = "red";
    document.getElementById(controllerButtonId).disabled = false;
    document.getElementById(centerButtonId).disabled = false;
    text = "Take Control"
    if (capturingData) {
        text = "Release"
    }

    document.getElementById(controllerButtonId).innerText = text;
    inUse = false;
}

// Phone orientation change event, triggers every time the orientation changes
function handleOrientation(event) {
    if (connected && capturingData && !inUse) {
        if (resetOffset) {
            resetOffset = false;
            alphaOffset = convertValue(event.alpha);
            betaOffset = -convertValue(event.beta);
            gammaOffset = -convertValue(event.gamma);
        }

        alpha = calculateRealOffset(event.alpha, alphaOffset);
        beta = calculateRealOffset(-event.beta, betaOffset);
        gamma = calculateRealOffset(-event.gamma, gammaOffset);
        moveDot(gamma, -beta);

        sendData(userId, useTopic);
        sendData(alpha, zTopic);
        sendData(-beta, xTopic);
        sendData(gamma, yTopic);
    }
};

function calculateRealOffset(realValue, offset) {
    return (convertValue((realValue + offset) % 360)).toFixed(2);
}

function convertValue(value) {
    modifiedValue = value % 180;
    if (value > 179) {
        modifiedValue = -180 + modifiedValue;
    }
    return -modifiedValue
}

function moveDot(xOffset, yOffset) {
    dot = document.getElementById(dotId)
    dot_radius = parseInt(dot.style.height);
    rect_size = parseInt(document.getElementById(controllerBorderId).style.height.replace("px", ""));
    baseX = (rect_size / 2) - dot_radius / 2;
    baseY = baseX;
    dot.style.left = offsetDot(baseX, xOffset, { minVal: 0, maxVal: rect_size - dot_radius }) + "px"
    dot.style.bottom = offsetDot(baseY, yOffset, { minVal: 0, maxVal: rect_size - dot_radius }) + "px"

}

function changeControllerDotVisibility(visible) {
    if (visible) {
        document.getElementById(dotId).style.display = "block";
    } else {
        document.getElementById(dotId).style.display = "none";
    }
}

function offsetDot(base, offset, treshold) {
    product = Number(base + parseInt(offset * 2));
    if (product < treshold.minVal) {
        return treshold.minVal;
    } else if (product > treshold.maxVal) {
        return treshold.maxVal;
    }
    return product;
}

// Publishes given data to a given subtopic under the specified main MQTT topic
function sendData(data, subtopic) {
    if (data == RELEASE_TEXT || (connected && capturingData && !inUse)) {
        var message = new Paho.Message("" + data);
        message.destinationName = mainTopic + subtopic;
        message.qos = 0;
        client.send(message);
    }
}

function incrementCounter() {
    if (useTimeout > 0 && inUse) {
        useTimeout--;
    }
    if (useTimeout == 0) {
        releaseController();
    }
    if (connected && capturingData && !inUse) {
        counter += 1;
    }
}

// Generates a temprorary universal unique id for the user
function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}