var WebSocketServer = require('ws').Server;
var ws = new WebSocketServer({ port: process.env.PORT || 6662 });
var json = JSON.stringify;
var parse = JSON.parse;

var waiting = null;

ws.on('connection', socket => {
  socket.id = (Math.random() * 10e8 | 0).toString(36);

  console.log('connected:', socket.id);

  if (!waiting) {
    waiting = socket;
    console.log('waiting:', socket.id);
  } else {
    console.log('match: %s <-> %s', socket.id, waiting.id);
    waiting.other = socket;
    socket.other = waiting;
    waiting = null;

    socket.send(json({ type: 'start', initiator: true }));
    socket.other.send(json({ type: 'start', initiator: false }));
  }

  socket.on('message', raw => {
    var msg = parse(raw);
    switch (msg.type) {
      case 'signal':
        socket.other.send(json({ type: 'signal', signal: msg.signal }));
        break;
    }
  });

  socket.on('close', () => {
    if (socket.other) {
      socket.other.close();
      socket.other.other = null;
    }
    if (socket === waiting) waiting = null;
    console.log('close', socket.id);
  });
});

ws.on('listening', () => console.log('listening'));
