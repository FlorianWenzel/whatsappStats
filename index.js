const express = require('express'),
    app = express(),
    interfacePort = 1337;

let http = require('http').Server(app);
app.use(express.static('client'));
http.listen(interfacePort);