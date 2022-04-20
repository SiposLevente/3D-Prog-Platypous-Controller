const RELEASE_TEXT = "released"
const TIMEOUT_VAL = 100;
const hostname = "192.168.1.150";
const port = 9001;
const mainTopic = "controller/";
const useTopic = "inUse";
const xTopic = "orietation/x";
const yTopic = "orietation/y";
const zTopic = "orietation/z";
const counterTopic = "counter";

const dotId = "dot";
const controllerButtonId = "controller";
const controllerBorderId = "controll_border";

counter = 1;
userId = uuidv4();
clientId = userId;
alphaOffset = 0;
betaOffset = 0;
gammaOffset = 0;
useTimeout = TIMEOUT_VAL;

inUse = false;
connected = false
capturingData = false;
firstCapture = true;


client = new Paho.Client(hostname, port, "", clientId);

var options = {
    timeout: 3,

    //Gets Called if the connection has successfully been established
    onSuccess: function () {
        console.log("Connected!")
        connected = true
        client.subscribe(mainTopic + useTopic)
    },
    //Gets Called if the connection could not be established
    onFailure: function (message) {
        alert("Connection failed: " + message.errorMessage);
    }
};

client.connect(options);

window.addEventListener("deviceorientation", handleOrientation);
setInterval(updateAll, 10);

function controllButtonPressed() {
    capturingData = !capturingData
    if (capturingData) {
        document.getElementById(controllerButtonId).innerText = "Release";
        changeControllerDotVisibility(true);
    } else {
        document.getElementById(controllerButtonId).innerText = "Take Control";
        firstCapture = true;
        changeControllerDotVisibility(false);
        sendData(RELEASE_TEXT, useTopic);
    }
}

function centerDot() {
    firstCapture = true;
}

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
    document.getElementById(controllerButtonId).innerText = "In use!";
    console.log("Other device is using the controller");
    inUse = true;
    useTimeout = TIMEOUT_VAL;
}

function releaseController() {
    console.log("Other device released the controller");
    document.getElementById(dotId).style.backgroundColor = "red";
    document.getElementById(controllerButtonId).disabled = false;
    text = "Take Control"
    if (capturingData) {
        text = "Release"
    }

    document.getElementById(controllerButtonId).innerText = text;
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
        sendData(counter, counterTopic)
    }
}

function updateAll() {
    incrementCounter();
}

function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}