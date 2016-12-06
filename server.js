var express = require('express'),
    app     = express(),
    server  = require('http').createServer(app);

app.use('/', express.static(__dirname + '/www'));
server.listen(8090);
console.log('server started');