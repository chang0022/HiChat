var express = require('express'),
    app     = express(),
    server  = require('http').createServer(app),
    io = require('socket.io').listen(server);

app.use('/', express.static(__dirname + '/www'));
server.listen(8090);

io.on('connection', function(socket) {
    socket.on('foo', function(data) {
        console.log(data);
    });
});