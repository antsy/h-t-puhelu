const port = 9909;
const host = 'valot.party';

const dgram = require('dgram');

const red = 255 * 0.45;
const green = 255 * 0.24;
const blue = 255 * 0.17;

const msg = new Uint8Array([
  1,
  1,  0, 0, red, green, blue,
  1,  1, 0, red, green, blue,
  1,  2, 0, red, green, blue,
  1,  3, 0, red, green, blue,
  1,  4, 0, red, green, blue,
  1,  5, 0, red, green, blue,
  1,  6, 0, red, green, blue,
  1,  7, 0, red, green, blue,
  1,  8, 0, red, green, blue,
  1,  9, 0, red, green, blue,
  1, 10, 0, red, green, blue,
  1, 11, 0, red, green, blue,
  1, 12, 0, red, green, blue,
  1, 13, 0, red, green, blue,
  1, 14, 0, red, green, blue,
  1, 15, 0, red, green, blue,
  1, 16, 0, red, green, blue,
  1, 17, 0, red, green, blue,
  1, 18, 0, red, green, blue,
  1, 19, 0, red, green, blue,
  1, 20, 0, red, green, blue,
  1, 21, 0, red, green, blue,
  1, 22, 0, red, green, blue,
  1, 23, 0, red, green, blue,
]);

const client = dgram.createSocket('udp4');
client.send(msg, 0, msg.length, port, host, function(err, bytes) {
    if (err) throw err;
    console.log(`UDP message sent to ${host}:${port}`);
    client.close();
});
