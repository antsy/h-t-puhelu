

var win = this; // window == this in global context
var canvas = document.getElementById('x');
var gl = canvas.getContext('webgl');
var i = 0;
for ($ in gl) gl[i++] = gl[$];
console.log(gl);
var width = canvas.width = win.innerWidth;
var height = canvas.height = win.innerHeight;
var floatArray = Float32Array;

var aspectRatio = width / height;
var epsilon = 1e-6;
var m = Math;
var sqrt = m.sqrt;

var fc = `gl_FragCoord`;
var fragmentShader = `
precision mediump float;
float rng( vec2 a ) { return fract( sin( a.x * 3433.8 + a.y * 3843.98 ) * 45933.8 ); }
uniform float t;

void main() {
float x=gl_FragCoord.x;
float y=gl_FragCoord.y;
vec2 v=vec2(x, y);
gl_FragColor = vec4(${fc}.x * rng(vec2(rng(v), t)) / ${width}.0, ${fc}.y / ${height}.0 * mod(${fc}.y, 2.0), 0, 1);
}`;

var u4 = 'uniform mat4 ';
var vertexShader = `precision mediump float;
attribute vec3 vp;
attribute vec2 vertTexCoord;
varying vec2 fragTexCoord;
${u4}w;
${u4}v;
${u4}p;

void main(){
fragTexCoord = vertTexCoord;
gl_Position = p * v * w * vec4(vp, 1.0);
}`;

var createShader = (type, source) => {
  var shader = gl[328](type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS); // DEBUG
  if (success) { // DEBUG
    return shader;
  } // DEBUG
  console.log(gl.getShaderInfoLog(shader)) // DEBUG
  gl.deleteShader(shader) // DEBUG
}

var createProgram = (vertexShader, fragmentShader) => {
  var program = gl.createProgram();
  var as = 'attachShader';
  gl[as](program, vertexShader);
  gl[as](program, fragmentShader);
  gl.linkProgram(program);

  var success = gl.getProgramParameter(program, gl.LINK_STATUS); // DEBUG
  if (success) { // DEBUG
    return program;
  } // DEBUG

  console.log(gl.getProgramInfoLog(program)); // DEBUG
  gl.deleteProgram(program); // DEBUG
}

var identityMatrix = 33825..toString(2).split``; // =  [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]

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
var perspective = (out, fovy, aspect, near, far) => {
  out.fill(0); // ES6 rules!
  var f = 1.0 / m.tan(fovy / 2),
    nf = 1 / (near - far);
  out[0] = f / aspect;
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
  var len = sqrt(x * x + y * y + z * z);
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
var glArrayBufferConstant = 34962;
var glElementArrayBufferConstant = 34963;
var glStaticDrawConstant = 35044;
var glFloatConstant = 5126;
var glFalse; // =undefined

var vertices = [-1, -1, 1, 1, -1, 1, 1, -1, -1, 1, -1, 1, -1, -1, 1, -1, -1, -1, -1, -1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, -1, -1, -1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, -1, 1, -1, -1, 1, 1, 1, 1, 1, 1, 1, -1, 1, 1, 1, -1, 1, 1, -1, 1, 2.39947, 1, 1, 2.39947, -1, 1, 1, 1, -1, 1, 1, 1, 1, 1, 1, 1, -1, 1, 1, -1, 1, 2.39947, -1, -1, 2.39947, -1, -1, 4.0671, -1, 1, 4.0671, 1, -1, 2.39947, 1, -1, 1, 3.15249, -1, 1, 3.15249, -1, 2.39947, -1, 1, 1, 1, -1, 2.39947, 1, -2.38009, 2.39947, 1, -2.38009, 1, 1, 1, 4.0671, -1, 1, 4.0671, -1, -1, 4.0671, 1, -1, 4.0671, -1, -1, 2.39947, 1, -1, 2.39947, 1, -1, 4.0671, -1, -1, 4.0671, -1, 1, 4.0671, 1, 1, 4.0671, 1, 1, 2.39947, 1, 1, 4.0671, 1, -1, 4.0671, -1, -2.38009, 1, 1, -2.38009, 1, 1, -2.38009, 2.39947, -1, -2.38009, 2.39947, 1, -1, 2.39947, -1, -1, 2.39947, -1, -2.38009, 2.39947, 1, -2.38009, 2.39947, -1, -2.38009, 1, -1, -2.38009, 2.39947, -1, -1, 1, 1, -1, 1, 1, -2.38009, 1, -1, -2.38009, 1, 3.15249, -1, 1, 3.15249, 1, 1, 3.15249, 1, 2.39947, 3.15249, -1, 2.39947, 1, -1, 1, 1, 1, 1, 3.15249, 1, 1, 3.15249, -1, 1, 1, 2.53678, 1, 3.15249, 2.53678, 1, 1, 1, 2.39947, 1, -1, 2.39947, 3.15249, -1, 2.39947, 3.15249, 1, 2.39947, 1, 2.53678, 1, 1, 2.53678, 2.39947, 3.15249, 2.53678, 2.39947, 3.15249, 2.53678, 1, 3.15249, 2.53678, 1, 3.15249, 2.53678, 2.39947, 3.15249, 2.53678, 2.39947, 1, 2.53678, 2.39947, 1, 1, 1, 1, 1, 2.39947, 1, 2.53678, 2.39947, 1, 2.53678, 1];
var indices = [2, 3, 4, 2, 4, 5, 6, 7, 8, 6, 8, 9, 39, 7, 32, 32, 7, 64, 39, 32, 31, 31, 32, 33, 32, 64, 65, 31, 33, 34, 10, 11, 12, 10, 12, 13, 14, 15, 16, 14, 16, 17, 16, 40, 41, 16, 41, 42, 40, 53, 54, 40, 54, 55, 18, 19, 20, 18, 20, 21, 22, 23, 24, 22, 24, 25, 25, 24, 51, 25, 51, 52, 35, 36, 37, 35, 37, 38, 43, 44, 45, 43, 45, 46, 47, 48, 49, 47, 49, 50, 56, 57, 58, 56, 58, 59, 60, 61, 62, 60, 62, 63, 66, 67, 68, 66, 68, 69, 70, 71, 72, 70, 72, 73, 72, 71, 88, 72, 88, 89, 74, 75, 76, 74, 76, 77, 76, 75, 78, 76, 78, 79, 80, 81, 82, 80, 82, 83, 80, 83, 90, 80, 90, 91, 84, 85, 86, 84, 86, 87, 92, 93, 94, 92, 94, 95];

var c = 'createBuffer';
var vertexBuffer = gl[c]();
var indexBuffer = gl[c]();
var positionAttributeLocation = gl[l = 'getAttribLocation'](program, 'vp');
var ul = 'getUniformLocation';
var matWorldUniformLocation = gl[ul](program, 'w');
var matViewUniformLocation = gl[ul](program, 'v');
var matProjUniformLocation = gl[ul](program, 'p');
var e = 'enableVertexAttribArray';
var worldMatrix = new floatArray(16);
var viewMatrix = [-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, -8, 1];
var projMatrix = new floatArray(16);

gl[b = 'bindBuffer'](glArrayBufferConstant, vertexBuffer);
gl[d = 'bufferData'](glArrayBufferConstant, new floatArray(vertices), glStaticDrawConstant);

gl[b](glElementArrayBufferConstant, indexBuffer);
gl[d](glElementArrayBufferConstant, new Uint16Array(indices), glStaticDrawConstant);

gl[b](glArrayBufferConstant, vertexBuffer);
gl.vertexAttribPointer(
  positionAttributeLocation, // Attribute location
  3, // Number of elements per attribute
  glFloatConstant, // Type of elements (gl.FLOAT)
  glFalse,
  12, // Size of an individual vertex (3 * Float32Array.BYTES_PER_ELEMENT)
  0
);
gl[e](positionAttributeLocation);


// Use shaders
gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

// User program
gl.useProgram(program);

perspective(projMatrix, 0.8, aspectRatio, epsilon, 1e3);

gl[u = 'uniformMatrix4fv'](matWorldUniformLocation, glFalse, worldMatrix);
gl[u](matViewUniformLocation, glFalse, viewMatrix);
gl[u](matProjUniformLocation, glFalse, projMatrix);

var xRotationMatrix = new floatArray(16);
var yRotationMatrix = new floatArray(16);

var testi = " abcdefghijklmnop üýþÿ" // DEBUG
for (var c in testi) { // DEBUG
  var number = (testi.charCodeAt(c) - 32) / 223 // DEBUG
  console.log(c, testi[c], number.toFixed(4), number); // DEBUG
} // DEBUG

var angle = 0;
r = () => {

  win.requestAnimationFrame(r, canvas);

  gl.clearColor(0.6, 0.8, 1, 1)
  // gl.COLOR_BUFFER_BIT | gl.COLOR_BUFFER_BIT == 4**7
  gl.clear(4 ** 7)

  angle = performance.now() / 1e3;
  rotate(yRotationMatrix, identityMatrix, angle, 0, 1, 0);
  rotate(xRotationMatrix, identityMatrix, angle / 2, 1, 0, 0);
  multiply(worldMatrix, yRotationMatrix, xRotationMatrix);
  gl[u](matWorldUniformLocation, glFalse, worldMatrix);
  gl.drawElements(4, indices.length, 5123, 0); // gl.TRIANGLES = 4, gl.UNSIGNED_SHORT = 5123

  var uniformTimeHandle = gl[ul](program, 't');
  gl.uniform1f(uniformTimeHandle, new Date().getMilliseconds());
}

s = () => {
  // sounds
  var audioContext = new AudioContext()
  var o = audioContext.createOscillator()
  o.type = "sawtooth"
  o.connect(audioContext.destination)
  o.frequency.value = 666
  o.start()
  s = () => {}; // ':D
}

r() // DEBUG
//setTimeout(() => s(), 0) // DEBUG

console.log(2 ** 14)
console.log(~~1.8)
console.log((() => { var x = m.sin(new Date().getMilliseconds()) * 10000; return x-~~x; })())

