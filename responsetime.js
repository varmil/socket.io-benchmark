var io = require('socket.io-client');

var message = 'o bispo de constantinopla nao quer se desconstantinopolizar';

function user(host, port) {
  var start = new Date();

  var socket = io.connect('http://' + host + ':' + port, {'force new connection': true});

  socket.on('connect', function() {
    // send loop message
    socket.send(message);

    socket.on('message', function(message) {
      console.log(new Date() - start);
      setTimeout(function() {
        start = new Date();
        socket.send(message);
      }, 1000)
    });
  });
}

var argvIndex = 2;
var host = process.argv[argvIndex++] ? process.argv[argvIndex - 1] : 'localhost';
var port = process.argv[argvIndex++] ? process.argv[argvIndex - 1] : '13451';

user(host, port);
