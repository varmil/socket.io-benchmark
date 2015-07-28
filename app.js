var profiler = require('v8-profiler');
var exec = require('child_process').exec;

// socketio options
var options = {};
// transport setting
var transport = process.argv.length >= 2 ? process.argv[2] : null;
if (transport) {
  options.transports = [transport];
}

var io = require('socket.io')(3000, options);


// command to read process consumed memory and cpu time
var getCpuCommand = 'ps u -p ' + process.pid + ' | grep ' + process.pid;

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

  // call a system command (ps) to get current process resources utilization
  exec(getCpuCommand, function(error, stdout, stderr) {
    var s = stdout.split(/\s+/);
    var cpu = s[2];
    var memory = s[3];

    var l = [
      'U: ' + users,
      'MR/S: ' + countReceived,
      'MS/S: ' + countSended,
      'MR/S/U: ' + msuReceived,
      'MS/S/U: ' + msuSended,
      'CPU: ' + cpu,
      'Mem: ' + memory
    ];

    console.log(l.join(',\t'));
    countReceived = 0;
    countSended = 0;
  });

}, 1000);

io.sockets.on('connection', function(socket) {

  users++;

  socket.on('message', function(message) {
    socket.send(message);
    countReceived++;
    countSended++;
  });

  socket.on('broadcast', function(message) {
    countReceived++;

    io.sockets.emit('broadcast', message);
    countSended += users;

    socket.emit('broadcastOk');
  });

  socket.on('disconnect', function() {
    users--;
  });
});
