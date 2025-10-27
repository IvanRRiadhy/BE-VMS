import WebSocket, { WebSocketServer } from 'ws';

const ws = new WebSocket('ws://localhost:16574/ws', {
  perMessageDeflate: false,
});
ws.on('error', console.error);

ws.on('open', function open() {
  // ws.send('something');
});

ws.on('message', function message(data) {
  var data = data;

  console.log('received: %s', data);
});

