var url = 'ws://localhost:6662/';
var json = JSON.stringify;
var parse = JSON.parse;

var connectTimeout;
var peer;

connect();

function connect() {
  var ws = new WebSocket(url);

  ws.onclose = ws.onerror = reconnect;

  ws.onopen = e => {
    console.log('connected');
  };

  ws.onmessage = raw => {
    var msg = parse(raw.data);
    switch (msg.type) {
      case 'start':
        peer = new simplePeer({ initiator: msg.initiator });
        peer.on('connect', () => {
          console.log('connected to peer!');
          peer.send('hello');
        });
        peer.on('data', data => {
          var text = new TextDecoder('utf-8').decode(data);
          console.log('received from peer:', text);
        });
        peer.on('signal', signal => {
          ws.send(json({ type: 'signal', signal: signal }));
        });
        break;

      case 'signal':
        peer.signal(msg.signal);
        break;
    }
  };
}

function reconnect() {
  console.log('connection dropped, reconnecting...');
  clearTimeout(connectTimeout);
  connectTimeout = setTimeout(connect, 1000);
}
