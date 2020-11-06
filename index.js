var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', (req, res) => {
//  res.send('<h1>Hello world</h1>');
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected from browser');

  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
  });
  socket.on('disconnect', () => {
    console.log('user disconnected from the bowser');
  });
});

http.listen(5000, () => {
  console.log('listening on *:5000');
});
