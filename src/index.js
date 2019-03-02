var win = this; // window == this in global context
var canvas = document.getElementById('x');
var gl = canvas.getContext('webgl2');
var textArea = document.getElementById('y');
var i = j = 0;
for (Z in gl) gl[Z[0]+Z[6]] = gl[Z]; // Neat trick to shorten (some of the) names of webgl functions
// console.log(gl); // and its results
var width = canvas.width = win.innerWidth;
var height = canvas.height = win.innerHeight;
var floatArray = Float32Array;

var m = Math;
var seed = 1;
var rng = () => {
  var x = m.sin(seed++) * 10000;
  return x - ~~x;
}

/**
 * Helper function to compile shader
 *
 * @param {number} type    gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
 * @param {string} source  GLSL source code
 */
var createShader = (type, source) => {
  var shader = gl.cS(type); // cS: ƒ createShader()
  gl.sS(shader, source); // sS: ƒ shaderSource()
  gl.ce(shader); // ce: ƒ compileShader()

  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS); // DEBUG
  if (success) { // DEBUG
    return shader;
  } // DEBUG
  console.log(gl.getShaderInfoLog(shader)) // DEBUG
  gl.deleteShader(shader) // DEBUG
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
  for (i = 0; i < 9; i = i + 3) {
    for (j = 0; j < 4; j++) {
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
  for (i = 0; i < 16; i = i + 4) {
    for (j = 0; j < 4; j++) {
      out[i + j] = b[i] * a[j] + b[i + 1] * a[4 + j] + b[i + 2] * a[8 + j] + b[i + 3] * a[12 + j];
    }
  }
  return out;
};

// gl.VERTEX_SHADER = 35633
// gl.FRAGMENT_SHADER = 35632

// t = progress timer
// c = ambient color
// f = from vertex shader
// u = 0: background, 1: dude
var fragmentShader = createShader(35632, `#version 300 es
precision mediump float;float rng(vec2 a){return fract(sin(a.x*3433.8+a.y*3843.98)*45933.8);}uniform float t;uniform vec3 c;in vec3 f;out vec4 o;uniform float u;
void main(){vec3 l=vec3(0.5,0.5,1);float light=dot(f,l)* 0.8+1.2;
if (u==0.0) {o=vec4(gl_FragCoord.y*c.y/${height}.0*mod(gl_FragCoord.y-sin(gl_FragCoord.x/t)*4.0,5.0),gl_FragCoord.x*c.x*rng(vec2(rng(gl_FragCoord.xy),t))/${width}.0,gl_FragCoord.z*c.z,1.0);}else{o=vec4(vec3((gl_FragCoord.x*rng(vec2(u,t))/${width}.0),gl_FragCoord.y/${height}.0*mod(gl_FragCoord.y,2.0),f.z*c.z).rgb*light,1.0);}}`);

var vertexShader = createShader(35633, `#version 300 es
precision mediump float;in vec3 vp;in vec3 vn;out vec3 f;uniform mat4 w;uniform mat4 v;uniform mat4 p;void main(){f = (w * vec4(vn, 0.0)).xyz;gl_Position = p * v * w * vec4(vp, 1.0);}`);

var program = gl.cP(); // cP: ƒ createProgram()
gl.aS(program, vertexShader); // aS: ƒ attachShader()
gl.aS(program, fragmentShader);
gl.lo(program); // lo: ƒ linkProgram()

var success = gl.getProgramParameter(program, gl.LINK_STATUS); // DEBUG
if (!success) { // DEBUG
  console.log(gl.getProgramInfoLog(program)); // DEBUG
  gl.deleteProgram(program); // DEBUG
} // DEBUG

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
vertices[0] = [0.32,-1,0.4,0,-0.61,0.4,0,-0.61,0,0.32,-1,0,0.91,-1,0,0.53,-0.14,0,0.53,-0.14,0.4,0.91,-1,0.4,0.91,-1,0.4,0.53,-0.14,0.4,0,-0.61,0.4,0.32,-1,0.4,0.32,-1,0,0.91,-1,0,0.91,-1,0.4,0.32,-1,0.4,0.33,0.58,0.4,0.33,0.58,0,0.27,0.94,0,0.27,0.94,0.4,0.33,0.58,0,0.33,0.58,0.4,1,0.3,0.4,1,0.3,0,0,-0.61,0.4,0.33,0.58,0.4,0,0.42,0.4,0.27,0.94,0,0,1,0,0,1,0.4,0.27,0.94,0.4,0.27,0.94,0.4,0,1,0.4,1,0.01,0.4,1,0.01,0,1,0.3,0,1,0.3,0.4,0.53,-0.14,0.4,0.53,-0.14,0,1,0.01,0,1,0.01,0.4,1,0.01,0.4,1,0.3,0.4];
indices = [0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,8,10,11,24,9,25,25,9,41,24,25,26,26,25,31,25,41,42,26,31,32,12,13,14,12,14,15,16,17,18,16,18,19,20,21,22,20,22,23,27,28,29,27,29,30,33,34,35,33,35,36,37,38,39,37,39,40];
normals = [-0.7787,-0.6274,0,-0.7787,-0.6274,0,-0.7787,-0.6274,0,-0.7787,-0.6274,0,0.9147,0.4041,0,0.9147,0.4041,0,0.9147,0.4041,0,0.9147,0.4041,0,0,0,1,0,0,1,0,0,1,0,0,1,0.0134,-0.9999,0,0.0134,-0.9999,0,0.0134,-0.9999,0,0.0134,-0.9999,0,0.9846,0.175,0,0.9846,0.175,0,0.9846,0.175,0,0.9846,0.175,0,0.3939,0.9191,0,0.3939,0.9191,0,0.3939,0.9191,0,0.3939,0.9191,0,0,0,1,0,0,1,0,0,1,0.2239,0.9746,0,0.2239,0.9746,0,0.2239,0.9746,0,0.2239,0.9746,0,0,0,1,0,0,1,1,0,0,1,0,0,1,0,0,1,0,0,0.3065,-0.9519,0,0.3065,-0.9519,0,0.3065,-0.9519,0,0.3065,-0.9519,0,0,0,1,0,0,1];
vertices[1] = vertices[0].map((x, i) => i%3 ? x: -x) // mirror x & y
//vertices[2] = vertices[0].map((x, i) => i%3!=1 ? x+1: x)
//vertices[3] = vertices[1].map((x, i) => i%3!=1 ? x+1: x)
//vertices[4] = vertices[0].map((x, i) => i%3!=1 ? x+2: x)
//vertices[5] = vertices[1].map((x, i) => i%3!=1 ? x+2: x)

var worldMatrix = new floatArray(16);
var viewMatrix = [-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, -4, 1];
var projMatrix = new floatArray(16);

var ul = 'getUniformLocation';
var matWorldUniformLocation = gl[ul](program, 'w');
var matViewUniformLocation = gl[ul](program, 'v');
var matProjUniformLocation = gl[ul](program, 'p');

var objectPickerUniform = gl[ul](program, 'u');
var ambientColorUniform = gl[ul](program, 'c');

var xRotationMatrix = new floatArray(16);
var yRotationMatrix = new floatArray(16);

var progress = 0;
var roundedProgress = 0;
var startTime;
var soundInterval;
var oscillator;

// Party arena light server
var webscoket = new WebSocket("ws://valot.party:9910");
var colorChanger = (red, green, blue) => {
  var colorArray = [1];
  for(var i = 0;i<24;i++) {
    colorArray.push(1, i, 0, ~~(255*red), ~~(255*green), ~~(255*blue));
  }
  var bytearray = new Uint8Array(colorArray);
  try {
    webscoket.send(bytearray);
    // console.log(bytearray);
    //console.log(m.round(red*255, 2), m.round(green*255, 2), m.round(blue*255, 2));
  } catch(e) {
  }
}

var identityMatrix = 33825..toString(2).split``; // =  [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
r = () => {
  if (!startTime) {
    startTime = performance.now();
  }

  var glFalse; // =undefined

  // Use program
  gl.ug(program); // ug: ƒ useProgram()

  // gl.COLOR_BUFFER_BIT | gl.COLOR_BUFFER_BIT == 4**7
  //gl.clear(4**7) // note: not shortened

  roundedProgress = ~~progress;
  progress = (performance.now() - startTime) / 1e3;

  var red = m.abs(0.45 * m.sin(progress));
  var green = m.abs(0.24 * m.sin(progress));
  var blue = m.abs(0.17 * m.sin(progress));
  if (progress < 5) {
    textArea.innerHTML = '';
    red = green = blue = (progress) * 0.1;
    colorChanger(red, green, blue);
  } else if (progress > 45) {
    colorChanger();
  } else {
    // Helevetimmoinen väläkytys
    if (~~((progress * 100) % 2)) {
      colorChanger(1, 1, 1)
    } else {
      colorChanger(0,0,0)
    }
  }

  // Rotate to identity matrix
  gl.um(matWorldUniformLocation, glFalse, identityMatrix); // um: ƒ uniformMatrix4fv()
  gl.uniform1f(objectPickerUniform, 0); // note: not shortened
  gl.uniform3f(ambientColorUniform, red, green, blue);
  var backgroundBuffer = gl.cB();
  // gl.ARRAY_BUFFER = 34962
  // gl.STATIC_DRAW = 35044
  gl.bf(34962, backgroundBuffer);
  // Draw background
  gl.bD(
    34962,
    new Float32Array([
      -10.0, -100.0,
      100.0, -10.0,
      -10.0, 100.0,
      -10.0, 100.0,
      100.0, -10.0,
      100.0, 100.0,
    ]),
    35044
  );
  gl.vA( // vA: ƒ vertexAttribPointer()
    positionAttributeLocation, // Attribute location
    2, // Number of elements per attribute
    5126, // Type of elements (5126 = gl.FLOAT)
    glFalse,
    8, // Size of an individual vertex (2 * Float32Array.BYTES_PER_ELEMENT)
    0
  );
  gl.eV(positionAttributeLocation);
  gl.de(4, 6, 5123, 0); // gl.TRIANGLES = 4, gl.UNSIGNED_SHORT = 5123

  // Rotate the object
  rotate(yRotationMatrix, identityMatrix, progress * 2, 0, 1, 0);
  rotate(xRotationMatrix, identityMatrix, m.sin(progress)/1.5, 1, 0, 0);
  multiply(worldMatrix, yRotationMatrix, xRotationMatrix);
  gl.um(matWorldUniformLocation, glFalse, worldMatrix); // um: ƒ uniformMatrix4fv()

  gl.depthFunc(gl.LEQUAL); // Near things obscure far things

  if (progress > 5) {
    const textArray = "Kerro osoite,Voitteko tulla pian?,On ihan kurkku auki,VERTA TULEE,Kuka siihen iski?,Henkirikos,Paina haavakohtaa,Verta on tosi paljon,Lopeta!,Puukotettu kaulaan,Poliisipartio on matkalla,Ambulanssi nopeasti,Se kuolee tuo mies".split(',')
    textArea.style.color = 'white';
    textArea.innerHTML = textArray[roundedProgress % textArray.length];
    textArea.style.left = width * rng();
    textArea.style.top = height * rng();
  }
  if (progress > 25) {
    // the amazing exploding man
    var i = ~~(rng()*vertices[1].length);
    vertices[0][i] = vertices[0][i] + (m.sin(progress)*.1);
    vertices[1][i] = vertices[1][i] + (m.sin(progress)*.1);
  }
  if (progress > 45) {
    // The end
    clearInterval(soundInterval);
    gl.co(0,0,0,1);
    gl.clear(4**7);
    textArea.innerHTML = '';
    setTimeout(() => {
      oscillator.stop();
    }, 4000)
    return;
  }

  if (progress - ~~progress < 0.01) { // DEBUG
    console.log(~~progress) // DEBUG
  } // DEBUG

  var vertexBuffer = [];
  var indexBuffer = [];
  var normalBuffer = [];
  for (i=0;i<vertices.length;i++) {

    var positionAttributeLocation = gl.gr(program, 'vp'); // gr: ƒ getAttribLocation()
    var normalAttributeLocation = gl.gr(program, 'vn');
    gl.uniform1f(objectPickerUniform, 2); // note: not shortened

    vertexBuffer[i] = gl.cB(); // cB: ƒ createBuffer()
    indexBuffer[i] = gl.cB();
    normalBuffer[i] = gl.cB();

    // Bind vertex buffer
    // gl.StaticDrawConstant = 35044, gl.ArrayBufferConstant = 34962;
    gl.bf(34962, vertexBuffer[i]); // bf: ƒ bindBuffer()
    gl.bD(34962, new floatArray(vertices[i]), 35044); // bD: ƒ bufferData()
    gl.vA( // vA: ƒ vertexAttribPointer()
      positionAttributeLocation, // Attribute location
      3, // Number of elements per attribute
      5126, // Type of elements (5126 = gl.FLOAT)
      glFalse,
      12, // Size of an individual vertex (3 * Float32Array.BYTES_PER_ELEMENT)
      0
    );
    gl.eV(positionAttributeLocation); // eV: ƒ enableVertexAttribArray()

    // Bind index buffer
    // gl.ElementArrayBuffer = 34963;
    gl.bf(34963, indexBuffer[i]); // bf: ƒ bindBuffer()
    gl.bD(34963, new Uint16Array(indices), 35044); // bD: ƒ bufferData()

    // Bind normal buffer
    gl.bf(34962, normalBuffer[i]);
    gl.bD(34962, new floatArray(normals), 35044);

    gl.bf(34962, normalBuffer[i]);
    gl.vA(
      normalAttributeLocation,
      3,
      5126,
      gl.TRUE,
      12, // Size of an individual vertex (3 * Float32Array.BYTES_PER_ELEMENT)
      0
    );
    gl.eV(normalAttributeLocation); // eV: ƒ enableVertexAttribArray()

    gl.vr(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight); // vr: ƒ viewport()

    perspective(projMatrix, 0.8, 1e-6, 1e3); // 1e-6 is our epsilon value

    gl.um(matWorldUniformLocation, glFalse, worldMatrix); // um: ƒ uniformMatrix4fv()
    gl.um(matViewUniformLocation, glFalse, viewMatrix); // um: ƒ uniformMatrix4fv()
    gl.um(matProjUniformLocation, glFalse, projMatrix); // um: ƒ uniformMatrix4fv()

    var uniformTimeHandle = gl[ul](program, 't');
    gl.uniform1f(uniformTimeHandle, progress); // note: not shortened

    // de: ƒ drawElements()
    gl.de(4, indices.length, 5123, 0); // gl.TRIANGLES = 4, gl.UNSIGNED_SHORT = 5123
  }

  win.requestAnimationFrame(r);
}

s = () => {
  var audioContext = new AudioContext();
  oscillator = audioContext.createOscillator();
  // sounds
  oscillator.type = "sawtooth";
  oscillator.connect(audioContext.destination);
  oscillator.start();
  s = () => {}; // ':D
  soundInterval = setInterval(() => {
    var time = performance.now() - startTime;
    oscillator.detune.value = oscillator.detune.value + m.sin(time) * 12;
    oscillator.frequency.value = m.cos(time) * 48 + (progress * 24);
  }, 160)
}

r() // DEBUG
//setTimeout(() => s(), 0) // DEBUG

console.log((() => { var x = m.sin(new Date().getMilliseconds()) * 10000; return x-~~x; })())

