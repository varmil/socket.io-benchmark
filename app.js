var profiler = require('v8-profiler');
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(3000);

var users = 0;
var countReceived = 0;
var countSended = 0;

function roundNumber(num, precision) {
  return parseFloat(Math.round(num * Math.pow(10, precision)) / Math.pow(10, precision));
}

setInterval(function() {
  var auxReceived = roundNumber(countReceived / users, 1);
  var msuReceived = (users > 0 ? auxReceived : 0);

  var auxSended = roundNumber(countSended / users, 1);
  var msuSended = (users > 0 ? auxSended : 0);

  var l = [
    'U: ' + users,
    'MR/S: ' + countReceived,
    'MS/S: ' + countSended,
    'MR/S/U: ' + msuReceived,
    'MS/S/U: ' + msuSended,
  ];

  console.log(l.join(',\t'));
  countReceived = 0;
  countSended = 0;

}, 1000);


app.all('*', function(req, res, next) {
  // res.setHeader('Connection', 'close');
  // res.end('accepted');

  // req.startTime = microtime.now();

  next();
});


app.get('/', function (req, res) {
  countReceived++;

  // EMIT TO ALL SOCKETS
  io.sockets.emit('everyone');

  countSended += users;

  res.setHeader('Connection', 'close');
  res.end('accepted');
});


io.sockets.on('connection', function(socket) {

  users = socket.client.conn.server.clientsCount;

  socket.on('disconnect', function() {
    users = socket.client.conn.server.clientsCount;
  });
});
