'use strict';
    console.log('NODE_ENV',process.env.NODE_ENV)
//setting environment variables
process.env.NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV : 'DEV';

//External Dependencies
var Hapi = require('hapi');

//Internal Dependencies
var Config = require('./Config');
console.log('selected tookan key',Config.tookanKeys.tookanLinksAndKeys.access_token);
var Routes = require('./Routes');
var Plugins = require('./Plugins');
var Bootstrap = require('./Utils/BootStrap');

//Create Server
var server = new Hapi.Server({
    app: {
        name: Config.appConstants.SERVER.appName
    }
});

server.connection({
    port: Config.appConstants.SERVER.PORTS.HAPI,
    routes: { cors: true }
});

//Register All Plugins
server.register(Plugins, function (err) {
    if (err){
        server.error('Error while loading plugins : ' + err)
    }else {
        server.log('info','Plugins Loaded')
    }
});

//Default Routes
//server.route(
//    {
//        method: 'GET',
//        path: '/',
//        handler: function (req, res) {
//            //TODO Change for production server
//            res.view('index')
//        }
//    }
//);

//API Routes
server.route(Routes);
Bootstrap.connectSocket(server);

Bootstrap.bootstrapAdmin(function (err, message) {
    if (err) {
        console.log('Error while bootstrapping admin : ' + err)
    } else {
        console.log(message);
    }
});


//Bootstrap Version data
Bootstrap.bootstrapAppVersion(function (err, message) {
    if (err) {
        console.log('Error while bootstrapping version : ' + err)
    } else {
        console.log(message);
    }
});

//Start Server
server.start(function () {
    server.log('info', 'Server running at: ' + server.info.uri);
});

