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


client = new Paho.Client(hostname, port, "", clientId);

var options = {
    timeout: 3,

    //Gets Called if the connection has successfully been established
    onSuccess: function () {
        console.log("Connected!")
        connected = true
        client.subscribe(mainTopic + "inUse")
    },
    //Gets Called if the connection could not be established
    onFailure: function (message) {
        alert("Connection failed: " + message.errorMessage);
    }
};

client.connect(options);

window.addEventListener("deviceorientation", handleOrientation);
setInterval(updateAll, 10);

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
    changeControllerDotVisibility(false);
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
            changeControllerDotVisibility(true);
            alphaOffset = convertValue(event.alpha);
            betaOffset = -convertValue(event.beta);
            gammaOffset = -convertValue(event.gamma);
        }

        alpha = calculateRealOffset(event.alpha, alphaOffset);
        beta = calculateRealOffset(-event.beta, betaOffset);
        gamma = calculateRealOffset(-event.gamma, gammaOffset);

        moveDot(gamma, -beta);

        sendData(userId, "inUse");
        sendData(alpha, "orientation/y");
        sendData(beta, "orientation/z");
        sendData(gamma, "orientation/x");
    }
};

function changeControllerDotVisibility(visible) {
    if (visible) {
        document.getElementById("dot").style.display = "block";
    } else {
        document.getElementById("dot").style.display = "none";
    }
}

function moveDot(xOffset, yOffset) {
    dot = document.getElementById("dot")
    dot_radius = parseInt(dot.style.height);
    rect_size = parseInt(document.getElementById("controll_border").style.height.replace("px", ""));
    baseX = (rect_size / 2) - dot_radius / 2;
    baseY = (rect_size / 2) - dot_radius / 2;

    dot.style.left = offsetDot(baseX, xOffset, { minVal: 0, maxVal: rect_size - dot_radius }) + "px"
    dot.style.bottom = offsetDot(baseY, yOffset, { minVal: 0, maxVal: rect_size - dot_radius }) + "px"

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
    if (data == "released" || (connected && capturingData && !inUse)) {
        var message = new Paho.Message("" + data);
        message.destinationName = mainTopic + "" + subtopic;
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
        sendData(counter, "counter")
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