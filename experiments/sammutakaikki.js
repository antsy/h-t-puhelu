const port = 9909;
const host = 'valot.party';

const dgram = require('dgram');

const msg = new Uint8Array([
  1,
  1,  0, 0, 0, 0, 0,
  1,  1, 0, 0, 0, 0,
  1,  2, 0, 0, 0, 0,
  1,  3, 0, 0, 0, 0,
  1,  4, 0, 0, 0, 0,
  1,  5, 0, 0, 0, 0,
  1,  6, 0, 0, 0, 0,
  1,  7, 0, 0, 0, 0,
  1,  8, 0, 0, 0, 0,
  1,  9, 0, 0, 0, 0,
  1, 10, 0, 0, 0, 0,
  1, 11, 0, 0, 0, 0,
  1, 12, 0, 0, 0, 0,
  1, 13, 0, 0, 0, 0,
  1, 14, 0, 0, 0, 0,
  1, 15, 0, 0, 0, 0,
  1, 16, 0, 0, 0, 0,
  1, 17, 0, 0, 0, 0,
  1, 18, 0, 0, 0, 0,
  1, 19, 0, 0, 0, 0,
  1, 20, 0, 0, 0, 0,
  1, 21, 0, 0, 0, 0,
  1, 22, 0, 0, 0, 0,
  1, 23, 0, 0, 0, 0,
]);

const client = dgram.createSocket('udp4');
client.send(msg, 0, msg.length, port, host, function(err, bytes) {
    if (err) throw err;
    console.log(`UDP message sent to ${host}:${port}`);
    client.close();
});
