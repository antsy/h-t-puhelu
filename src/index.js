

var win = this; // window == this in global context
var canvas = document.getElementById('x');
var gl = canvas.getContext('webgl');
var i = 0;
for (Z in gl) gl[i++] = gl[Z]; // Neat trick to shorten names of webgl functions
console.log(gl); // and its results
var width = canvas.width = win.innerWidth;
var height = canvas.height = win.innerHeight;
var floatArray = Float32Array;

var m = Math;

var fragmentShader = `
precision mediump float;
float rng( vec2 a ) { return fract( sin( a.x * 3433.8 + a.y * 3843.98 ) * 45933.8 ); }
uniform float t;

void main() {
float x=gl_FragCoord.x;
float y=gl_FragCoord.y;
vec2 v=vec2(x, y);
gl_FragColor = vec4(gl_FragCoord.x * rng(vec2(rng(v), t)) / ${width}.0, gl_FragCoord.y / ${height}.0 * mod(gl_FragCoord.y, 2.0), 0, 1);
}`;

var vertexShader = `precision mediump float;
attribute vec3 vp;
attribute vec2 vertTexCoord;
varying vec2 fragTexCoord;
uniform mat4 w;
uniform mat4 v;
uniform mat4 p;

void main(){
fragTexCoord = vertTexCoord;
gl_Position = p * v * w * vec4(vp, 1.0);
}`;

var createShader = (type, source) => {
  var shader = gl[328](type); // 328: ƒ createShader()
  gl[393](shader, source); // 393: ƒ shaderSource()
  gl[319](shader); // 319: ƒ compileShader()

  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS); // DEBUG
  if (success) { // DEBUG
    return shader;
  } // DEBUG
  console.log(gl.getShaderInfoLog(shader)) // DEBUG
  gl.deleteShader(shader) // DEBUG
}

var createProgram = (vertexShader, fragmentShader) => {
  var program = gl[326](); // 326: ƒ createProgram()
  var as = 'attachShader';
  gl[as](program, vertexShader);
  gl[as](program, fragmentShader);
  gl[386](program); // 386: ƒ linkProgram()

  var success = gl.getProgramParameter(program, gl.LINK_STATUS); // DEBUG
  if (success) { // DEBUG
    return program;
  } // DEBUG

  console.log(gl.getProgramInfoLog(program)); // DEBUG
  gl.deleteProgram(program); // DEBUG
}

/**
 * Generates a perspective projection matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} fovy Vertical field of view in radians
 * @param {number} aspect Aspect ratio. typically viewport width/height
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
var perspective = (out, fovy, near, far) => {
  out.fill(0); // ES6 rules!
  var f = 1.0 / m.tan(fovy / 2),
    nf = 1 / (near - far);
  out[0] = f / (width / height); // aspect ratio = width / height
  out[5] = f;
  out[10] = (far + near) * nf;
  out[11] = -1;
  out[14] = (2 * far * near) * nf;
  return out;
};

/**
 * Rotates a mat4 by the given angle around the given axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @param {vec3} axis the axis to rotate around
 * @returns {mat4} out
 */
var rotate = (out, a, rad, x, y, z) => {
  var len = m.sqrt(x * x + y * y + z * z);
  var s = m.sin(rad);
  var c = m.cos(rad);
  var t = 1 - c;

  //if (absolute(len) < epsilon) { return null; }

  len = 1 / len;
  x *= len;
  y *= len;
  z *= len;

  var b = [
    x * x * t + c, // b00 = 0
    y * x * t + z * s, // b01 = 1
    z * x * t - y * s, // b02 = 2
    x * y * t - z * s, // b10 = 3
    y * y * t + c, // b11 = 4
    z * y * t + x * s, // b12 = 5
    x * z * t + y * s, // b20 = 6
    y * z * t - x * s, // b21 = 7
    z * z * t + c, // b22 = 8
  ]

  var n = 0;
  for (var i = 0; i < 9; i = i + 3) {
    for (var j = 0; j < 4; j++) {
      out[n] = a[j] * b[i] + a[4 + j] * b[i + 1] + a[8 + j] * b[i + 2];
      n++;
    }
  }

  if (a !== out) { // If the source and destination differ, copy the unchanged last row
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }
  return out;
};

/**
 * Multiplies two mat4's explicitly not using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @returns {mat4} out
 */
var multiply = (out, a, b) => {
  for (var i = 0; i < 16; i = i + 4) {
    for (var j = 0; j < 4; j++) {
      out[i + j] = b[i] * a[j] + b[i + 1] * a[4 + j] + b[i + 2] * a[8 + j] + b[i + 3] * a[12 + j];
    }
  }
  return out;
};

// gl.VERTEX_SHADER = 35633
// gl.FRAGMENT_SHADER = 35632
var fragmentShader = createShader(35632, fragmentShader);
var vertexShader = createShader(35633, vertexShader);

var program = createProgram(vertexShader, fragmentShader);

/*var buffer = gl.createBuffer();
// gl.ARRAY_BUFFER = 34962
// gl.STATIC_DRAW = 35044
gl.bindBuffer(34962, buffer);
gl.bufferData(
  34962,
  new Float32Array([
    -1.0, -1.0,
    1.0, -1.0,
    -1.0, 1.0,
    -1.0, 1.0,
    1.0, -1.0,
    1.0, 1.0]),
  35044
);*/

// var testi = " abcdefghijklmnop üýþÿ" // DEBUG
// for (var c in testi) { // DEBUG
//   var number = (testi.charCodeAt(c) - 32) / 223 // DEBUG
//   console.log(c, testi[c], number.toFixed(4), number); // DEBUG
// } // DEBUG

// test object
//var vertices = [-1, -1, 1, 1, -1, 1, 1, -1, -1, 1, -1, 1, -1, -1, 1, -1, -1, -1, -1, -1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, -1, -1, -1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, -1, 1, -1, -1, 1, 1, 1, 1, 1, 1, 1, -1, 1, 1, 1, -1, 1, 1, -1, 1, 2.39947, 1, 1, 2.39947, -1, 1, 1, 1, -1, 1, 1, 1, 1, 1, 1, 1, -1, 1, 1, -1, 1, 2.39947, -1, -1, 2.39947, -1, -1, 4.0671, -1, 1, 4.0671, 1, -1, 2.39947, 1, -1, 1, 3.15249, -1, 1, 3.15249, -1, 2.39947, -1, 1, 1, 1, -1, 2.39947, 1, -2.38009, 2.39947, 1, -2.38009, 1, 1, 1, 4.0671, -1, 1, 4.0671, -1, -1, 4.0671, 1, -1, 4.0671, -1, -1, 2.39947, 1, -1, 2.39947, 1, -1, 4.0671, -1, -1, 4.0671, -1, 1, 4.0671, 1, 1, 4.0671, 1, 1, 2.39947, 1, 1, 4.0671, 1, -1, 4.0671, -1, -2.38009, 1, 1, -2.38009, 1, 1, -2.38009, 2.39947, -1, -2.38009, 2.39947, 1, -1, 2.39947, -1, -1, 2.39947, -1, -2.38009, 2.39947, 1, -2.38009, 2.39947, -1, -2.38009, 1, -1, -2.38009, 2.39947, -1, -1, 1, 1, -1, 1, 1, -2.38009, 1, -1, -2.38009, 1, 3.15249, -1, 1, 3.15249, 1, 1, 3.15249, 1, 2.39947, 3.15249, -1, 2.39947, 1, -1, 1, 1, 1, 1, 3.15249, 1, 1, 3.15249, -1, 1, 1, 2.53678, 1, 3.15249, 2.53678, 1, 1, 1, 2.39947, 1, -1, 2.39947, 3.15249, -1, 2.39947, 3.15249, 1, 2.39947, 1, 2.53678, 1, 1, 2.53678, 2.39947, 3.15249, 2.53678, 2.39947, 3.15249, 2.53678, 1, 3.15249, 2.53678, 1, 3.15249, 2.53678, 2.39947, 3.15249, 2.53678, 2.39947, 1, 2.53678, 2.39947, 1, 1, 1, 1, 1, 2.39947, 1, 2.53678, 2.39947, 1, 2.53678, 1];
//var indices = [2, 3, 4, 2, 4, 5, 6, 7, 8, 6, 8, 9, 39, 7, 32, 32, 7, 64, 39, 32, 31, 31, 32, 33, 32, 64, 65, 31, 33, 34, 10, 11, 12, 10, 12, 13, 14, 15, 16, 14, 16, 17, 16, 40, 41, 16, 41, 42, 40, 53, 54, 40, 54, 55, 18, 19, 20, 18, 20, 21, 22, 23, 24, 22, 24, 25, 25, 24, 51, 25, 51, 52, 35, 36, 37, 35, 37, 38, 43, 44, 45, 43, 45, 46, 47, 48, 49, 47, 49, 50, 56, 57, 58, 56, 58, 59, 60, 61, 62, 60, 62, 63, 66, 67, 68, 66, 68, 69, 70, 71, 72, 70, 72, 73, 72, 71, 88, 72, 88, 89, 74, 75, 76, 74, 76, 77, 76, 75, 78, 76, 78, 79, 80, 81, 82, 80, 82, 83, 80, 83, 90, 80, 90, 91, 84, 85, 86, 84, 86, 87, 92, 93, 94, 92, 94, 95];
// dude
//var vertices = [0.800403,-2.51017,1,0.013342,-1.53335,1,0.013342,-1.53335,-1,0.800403,-2.51017,-1,0.800403,-2.51017,-1,0.013342,-1.53335,-1,1.32466,-0.352762,-1,2.26914,-2.4905,-1,2.26914,-2.4905,-1,1.32466,-0.352762,-1,1.32466,-0.352762,1,2.26914,-2.4905,1,2.26914,-2.4905,1,1.32466,-0.352762,1,0.013342,-1.53335,1,0.800403,-2.51017,1,0.800403,-2.51017,-1,2.26914,-2.4905,-1,2.26914,-2.4905,1,0.800403,-2.51017,1,0.013342,-1.53335,-1,-0.006335,1.04427,-1,0.832749,1.45748,-1,0.832749,1.45748,1,0.832749,1.45748,-1,0.675337,2.34292,-1,0.675337,2.34292,1,0.832749,1.45748,-1,0.832749,1.45748,1,2.48558,0.749124,1,2.48558,0.749124,-1,0.013342,-1.53335,-1,0.013342,-1.53335,1,-0.006335,1.04427,1,-0.006335,1.04427,-1,0.013342,-1.53335,1,0.832749,1.45748,1,-0.006335,1.04427,1,0.675337,2.34292,-1,-0.008355,2.5,-1,-0.008355,2.5,1,0.675337,2.34292,1,-0.006335,1.04427,-1,-0.006335,1.04427,1,-0.008355,2.5,1,-0.008355,2.5,-1,0.675337,2.34292,1,-0.008355,2.5,1,-0.008355,2.5,-1,0.675337,2.34292,-1,2.48558,0.021092,1,2.48558,0.021092,-1,2.48558,0.749124,-1,2.48558,0.749124,1,1.32466,-0.352762,1,1.32466,-0.352762,-1,2.48558,0.021092,-1,2.48558,0.021092,1,2.48558,0.749124,-1,2.48558,0.021092,-1,2.48558,0.021092,1,2.48558,0.749124,1]
//var indices = [0,1,2,0,2,3,4,5,6,4,6,7,6,20,21,6,21,22,6,22,58,6,58,59,22,21,48,22,48,49,8,9,10,8,10,11,12,13,14,12,14,15,35,13,36,36,13,60,35,36,37,37,36,46,36,60,61,37,46,47,16,17,18,16,18,19,23,24,25,23,25,26,27,28,29,27,29,30,31,32,33,31,33,34,38,39,40,38,40,41,42,43,44,42,44,45,50,51,52,50,52,53,54,55,56,54,56,57];
// hollow man
var vertices = [];
vertices[0] = [0.32,-1,0.4,0,-0.61,0.4,0,-0.61,0,0.32,-1,0,0.91,-1,0,0.53,-0.14,0,0.53,-0.14,0.4,0.91,-1,0.4,0.91,-1,0.4,0.53,-0.14,0.4,0,-0.61,0.4,0.32,-1,0.4,0.32,-1,0,0.91,-1,0,0.91,-1,0.4,0.32,-1,0.4,0.33,0.58,0.4,0.33,0.58,0,0.27,0.94,0,0.27,0.94,0.4,0.33,0.58,0,0.33,0.58,0.4,1,0.3,0.4,1,0.3,0,0,-0.61,0.4,0.33,0.58,0.4,0,0.42,0.4,0.27,0.94,0,0,1,0,0,1,0.4,0.27,0.94,0.4,0.27,0.94,0.4,0,1,0.4,1,0.01,0.4,1,0.01,0,1,0.3,0,1,0.3,0.4,0.53,-0.14,0.4,0.53,-0.14,0,1,0.01,0,1,0.01,0.4,1,0.01,0.4,1,0.3,0.4]
indices = [0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,8,10,11,24,9,25,25,9,41,24,25,26,26,25,31,25,41,42,26,31,32,12,13,14,12,14,15,16,17,18,16,18,19,20,21,22,20,22,23,27,28,29,27,29,30,33,34,35,33,35,36,37,38,39,37,39,40];
vertices[1] = vertices[0].map((x, i) => i%3 ? x: -x) // mirror x & y


var worldMatrix = new floatArray(16);
var viewMatrix = [-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, -4, 1];
var projMatrix = new floatArray(16);

var ul = 'getUniformLocation';
var matWorldUniformLocation = gl[ul](program, 'w');
var matViewUniformLocation = gl[ul](program, 'v');
var matProjUniformLocation = gl[ul](program, 'p');

var xRotationMatrix = new floatArray(16);
var yRotationMatrix = new floatArray(16);

var angle = 0;
var startTime;

r = () => {
  if (!startTime) {
    startTime = performance.now();
  }

  var glFalse; // =undefined

  gl[315](0.6, 0.8, 1, 1) // 315: ƒ clearColor()
  // gl.COLOR_BUFFER_BIT | gl.COLOR_BUFFER_BIT == 4**7
  gl[314](4 ** 7) // 314: ƒ clear()

  angle = (performance.now() - startTime) / 1e3;
  var identityMatrix = 33825..toString(2).split``; // =  [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
  rotate(yRotationMatrix, identityMatrix, angle / 2, 0, 1, 0);
  rotate(xRotationMatrix, identityMatrix, angle / 20, 1, 0, 0);
  multiply(worldMatrix, yRotationMatrix, xRotationMatrix);
  gl[422](matWorldUniformLocation, glFalse, worldMatrix); // 422: ƒ uniformMatrix4fv()

  var vertexBuffer = [];
  var indexBuffer = [];
  for (var i=0;i<vertices.length;i++) {
    var positionAttributeLocation = gl[356](program, 'vp'); // 356: ƒ getAttribLocation()

    vertexBuffer[i] = gl[324](); // 324: ƒ createBuffer()
    indexBuffer[i] = gl[324]();

    // gl.StaticDrawConstant = 35044, gl.ArrayBufferConstant = 34962;
    gl[302](34962, vertexBuffer[i]); // 302: ƒ bindBuffer()
    gl[311](34962, new floatArray(vertices[i]), 35044); // 311: ƒ bufferData()

    // gl.ElementArrayBuffer = 34963;
    gl[302](34963, indexBuffer[i]); // 302: ƒ bindBuffer()
    gl[311](34963, new Uint16Array(indices), 35044); // 311: ƒ bufferData()

    gl[302](34962, vertexBuffer[i]); // 302: ƒ bindBuffer()
    gl[433]( // 433: ƒ vertexAttribPointer()
      positionAttributeLocation, // Attribute location
      3, // Number of elements per attribute
      5126, // Type of elements (5126 = gl.FLOAT)
      glFalse,
      12, // Size of an individual vertex (3 * Float32Array.BYTES_PER_ELEMENT)
      0
    );
    gl[346](positionAttributeLocation); // 346: ƒ enableVertexAttribArray()

    gl[434](0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight); // 434: ƒ viewport()

    // User program
    gl[423](program); // 423: ƒ useProgram()

    perspective(projMatrix, 0.8, 1e-6, 1e3); // 1e-6 is our epsilon value

    gl[422](matWorldUniformLocation, glFalse, worldMatrix); // 422: ƒ uniformMatrix4fv()
    gl[422](matViewUniformLocation, glFalse, viewMatrix); // 422: ƒ uniformMatrix4fv()
    gl[422](matProjUniformLocation, glFalse, projMatrix); // 422: ƒ uniformMatrix4fv()
    // 344: ƒ drawElements()
    gl[344](4, indices.length, 5123, 0); // gl.TRIANGLES = 4, gl.UNSIGNED_SHORT = 5123
  }

  var uniformTimeHandle = gl[ul](program, 't');
  gl[404](uniformTimeHandle, new Date().getMilliseconds()); // 404: ƒ uniform1f()

  win.requestAnimationFrame(r);
}

s = () => {
  var audioContext = new AudioContext();
  var o = audioContext.createOscillator();
  // sounds
  o.type = "sawtooth";
  o.connect(audioContext.destination);
  o.frequency.value = 666;
  o.start();
  s = () => {}; // ':D
  setInterval(() => {
    var time = performance.now() - startTime;
    o.detune.value = m.sin(time) * 100;
    o.frequency.value = m.cos(time) * 50 + 500;
  }, 100)
}

r() // DEBUG
//setTimeout(() => s(), 0) // DEBUG

console.log((() => { var x = m.sin(new Date().getMilliseconds()) * 10000; return x-~~x; })())

