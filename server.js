// Load required modules
var https    = require("https");
var fs      = require("fs");// https server core module
var express = require("express");           // web framework external module
var serveStatic = require('serve-static');  // serve static files
var socketIo = require("socket.io");        // web socket external module
var easyrtc = require("easyrtc");               // EasyRTC external module
var path = require("path");

// Set process name
process.title = "node-easyrtc";

// Setup and configure Express https server. Expect a subfolder called "static" to be the web root.
var app = express();
// define our routes
var router = express.Router();
router.get('/', function(req, res){
    res.sendFile(path.join(__dirname + '/pages/home.html'));
});
router.get('/about', function(req, res) {
    res.send('im the about page!');
});
router.get('/terms', function(req, res) {
    res.sendFile(path.join(__dirname + '/pages/terms.html'));
});

router.get('/privacy', function(req, res) {
    res.sendFile(path.join(__dirname + '/pages/privacy.html'));
});

// generic url for setting up the rooms
router.get('/old', function(req, res) {
    res.sendFile(path.join(__dirname + '/pages/invideocall-old.html'));
});

router.get('/:name', function(req, res) {
    res.sendFile(path.join(__dirname + '/pages/invideocall.html'));
});

//app.use(serveStatic('static', {'index': ['index.html']}));
// serve static assets from `assets` folder
app.use(express.static(path.join(__dirname + '/assets')));

// set the view engine to ejs
app.set('view engine', 'ejs');

// attach the router
app.use('/', router);

var selfSingedCertificate = {
    key: fs.readFileSync("/home/schartz/keys/selfSigned.key"),
    cert: fs.readFileSync("/home/schartz/keys/selfSigned.cert")
};
// Start Express https server on port 443
var webServer = https.createServer(selfSingedCertificate, app).listen(443);

// Start Socket.io so it attaches itself to Express server
var socketServer = socketIo.listen(webServer, {"log level":1});


// set up our STUN and TURN servers
var iceServers = [
    {"url":"stun:stun.l.google.com:19302"},
    {"url":"stun:stun1.l.google.com:19302"},
    {"url":"stun:stun2.l.google.com:19302"},
    {"url":"stun:stun3.l.google.com:19302"},
    {"url":"stun:stun4.l.google.com:19302"}
];

easyrtc.setOption("appIceServers", iceServers);
easyrtc.setOption("logLevel", "debug");

// Overriding the default easyrtcAuth listener, only so we can directly access its callback
easyrtc.events.on("easyrtcAuth", function(socket, easyrtcid, msg, socketCallback, callback) {
    easyrtc.events.defaultListeners.easyrtcAuth(socket, easyrtcid, msg, socketCallback, function(err, connectionObj){
        if (err || !msg.msgData || !msg.msgData.credential || !connectionObj) {
            callback(err, connectionObj);
            return;
        }

        connectionObj.setField("credential", msg.msgData.credential, {"isShared":false});

        console.log("["+easyrtcid+"] Credential saved!", connectionObj.getFieldValueSync("credential"));

        callback(err, connectionObj);
    });
});

// To test, lets print the credential to the console for every room join!
easyrtc.events.on("roomJoin", function(connectionObj, roomName, roomParameter, callback) {
    console.log("["+connectionObj.getEasyrtcid()+"] Credential retrieved!", connectionObj.getFieldValueSync("credential"));
    easyrtc.events.defaultListeners.roomJoin(connectionObj, roomName, roomParameter, callback);
});

// Start EasyRTC server
var rtc = easyrtc.listen(app, socketServer, null, function(err, rtcRef) {
    console.log("Initiated");

    rtcRef.events.on("roomCreate", function(appObj, creatorConnectionObj, roomName, roomOptions, callback) {
        console.log("roomCreate fired! Trying to create: " + roomName);

        appObj.events.defaultListeners.roomCreate(appObj, creatorConnectionObj, roomName, roomOptions, callback);
    });
});

//listen on port 443
webServer.listen(443, function () {
    console.log('listening on https://localhost');
});
