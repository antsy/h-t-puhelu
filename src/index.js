
// Some neat resources:
// https://github.com/acgessler/assimp2json
// https://skalman.github.io/UglifyJS-online/
// https://github.com/laurentlb/Shader_Minifier
// http://marcgg.com/blog/2016/11/01/javascript-audio/
// https://noisehack.com/generate-noise-web-audio-api/
// https://www.keithmcmillen.com/blog/making-music-in-the-browser-web-audio-api-part-1/
// http://www.cs.cornell.edu/courses/cs4620/2014fa/lectures/glsl1.pdf
// https://www.youtube.com/watch?v=DhSRvxVQ5HM (WebGL Lighting (2 of 5) - Surface Normals))
// https://www.youtube.com/watch?v=33gn3_khXxw (WebGL Tutorial 05 - Phong Lighting)
// https://www.youtube.com/watch?v=jBqYTgaFDxU (blender basics)

// https://medium.com/@omar4ur/flat-shading-in-webgl-with-playcanvas-a-quick-tip-97d1bd85258f
// https://www.shadertoy.com/view/ldf3RN (bokeh blur)

(() => {
  var canvas = document.getElementById('x')
  var gl = canvas.getContext('webgl')
  var w = window
  var width = canvas.width = w.innerWidth;
  var height = canvas.height = w.innerHeight;
  var aspectRatio = width / height;
  var epsilon = 1e-6;
  var sqrt = Math.sqrt;
  var absolute = Math.abs;

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
attribute vec3 vertPosition;
attribute vec2 vertTexCoord;
varying vec2 fragTexCoord;
uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

void main()
{
fragTexCoord = vertTexCoord;
gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
}`;

  var createShader = (type, source) => {
    var shader = gl.createShader(type);
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
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    var success = gl.getProgramParameter(program, gl.LINK_STATUS); // DEBUG
    if (success) { // DEBUG
      return program;
    } // DEBUG

    console.log(gl.getProgramInfoLog(program)); // DEBUG
    gl.deleteProgram(program); // DEBUG
  }

    var identityMatrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

    /**
     * Generates a look-at matrix with the given eye position, focal point, and up axis
     *
     * @param {mat4} out mat4 frustum matrix will be written into
     * @param {vec3} eye Position of the viewer
     * @param {vec3} center Point the viewer is looking at
     * @param {vec3} up vec3 pointing up
     * @returns {mat4} out
     */
    var lookAt = function (out, eye, center, up) {
      var x0, x1, x2, y0, y1, y2, z0, z1, z2, len,
          eyex = eye[0],
          eyey = eye[1],
          eyez = eye[2],
          upx = up[0],
          upy = up[1],
          upz = up[2],
          centerx = center[0],
          centery = center[1],
          centerz = center[2];

      if (absolute(eyex - centerx) < epsilon &&
          absolute(eyey - centery) < epsilon &&
          absolute(eyez - centerz) < epsilon) {
          return identityMatrix;
      }

      z0 = eyex - centerx;
      z1 = eyey - centery;
      z2 = eyez - centerz;

      len = 1 / sqrt(z0 * z0 + z1 * z1 + z2 * z2);
      z0 *= len;
      z1 *= len;
      z2 *= len;

      x0 = upy * z2 - upz * z1;
      x1 = upz * z0 - upx * z2;
      x2 = upx * z1 - upy * z0;
      len = sqrt(x0 * x0 + x1 * x1 + x2 * x2);
      if (!len) {
          x0 = 0;
          x1 = 0;
          x2 = 0;
      } else {
          len = 1 / len;
          x0 *= len;
          x1 *= len;
          x2 *= len;
      }

      y0 = z1 * x2 - z2 * x1;
      y1 = z2 * x0 - z0 * x2;
      y2 = z0 * x1 - z1 * x0;

      len = sqrt(y0 * y0 + y1 * y1 + y2 * y2);
      if (!len) {
          y0 = 0;
          y1 = 0;
          y2 = 0;
      } else {
          len = 1 / len;
          y0 *= len;
          y1 *= len;
          y2 *= len;
      }

      out[0] = x0;
      out[1] = y0;
      out[2] = z0;
      out[3] = 0;
      out[4] = x1;
      out[5] = y1;
      out[6] = z1;
      out[7] = 0;
      out[8] = x2;
      out[9] = y2;
      out[10] = z2;
      out[11] = 0;
      out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
      out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
      out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
      out[15] = 1;

      return out;
  };

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
    var perspective = function (out, fovy, aspect, near, far) {
      var f = 1.0 / Math.tan(fovy / 2),
          nf = 1 / (near - far);
      out[0] = f / aspect;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;
      out[5] = f;
      out[6] = 0;
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;
      out[10] = (far + near) * nf;
      out[11] = -1;
      out[12] = 0;
      out[13] = 0;
      out[14] = (2 * far * near) * nf;
      out[15] = 0;
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
	var rotate = function (out, a, rad, axis) {
    var x = axis[0], y = axis[1], z = axis[2],
        len = sqrt(x * x + y * y + z * z),
        s, c, t,
        a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23,
        b00, b01, b02,
        b10, b11, b12,
        b20, b21, b22;

    //if (absolute(len) < epsilon) { return null; }

    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;

    s = Math.sin(rad);
    c = Math.cos(rad);
    t = 1 - c;

    a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
    a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
    a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

    // Construct the elements of the rotation matrix
    b00 = x * x * t + c; b01 = y * x * t + z * s; b02 = z * x * t - y * s;
    b10 = x * y * t - z * s; b11 = y * y * t + c; b12 = z * y * t + x * s;
    b20 = x * z * t + y * s; b21 = y * z * t - x * s; b22 = z * z * t + c;

    // Perform rotation-specific matrix multiplication
    out[0] = a00 * b00 + a10 * b01 + a20 * b02;
    out[1] = a01 * b00 + a11 * b01 + a21 * b02;
    out[2] = a02 * b00 + a12 * b01 + a22 * b02;
    out[3] = a03 * b00 + a13 * b01 + a23 * b02;
    out[4] = a00 * b10 + a10 * b11 + a20 * b12;
    out[5] = a01 * b10 + a11 * b11 + a21 * b12;
    out[6] = a02 * b10 + a12 * b11 + a22 * b12;
    out[7] = a03 * b10 + a13 * b11 + a23 * b12;
    out[8] = a00 * b20 + a10 * b21 + a20 * b22;
    out[9] = a01 * b20 + a11 * b21 + a21 * b22;
    out[10] = a02 * b20 + a12 * b21 + a22 * b22;
    out[11] = a03 * b20 + a13 * b21 + a23 * b22;

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
	var multiply = function (out, a, b) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    // Cache only the current line of the second matrix
    var b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
    out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
    out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
    out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
    out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
    return out;
  };

  // gl.VERTEX_SHADER = 35633
  // gl.FRAGMENT_SHADER = 35632
  var fragmentShader = createShader(35632, fragmentShader);
  var vertexShader = createShader(35633, vertexShader);

  var program = createProgram(vertexShader, fragmentShader);

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

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
  var glFalse = undefined;

  var vertices = [-1,-1,1,1,-1,1,1,-1,-1,1,-1,1,-1,-1,1,-1,-1,-1,-1,-1,-1,-1,-1,1,-1,1,1,-1,1,-1,-1,1,-1,1,1,-1,1,-1,-1,-1,-1,-1,1,1,-1,1,1,1,1,-1,1,1,-1,-1,-1,1,-1,-1,1,1,1,1,1,1,1,-1,1,1,1,-1,1,1,-1,1,2.39947,1,1,2.39947,-1,1,1,1,-1,1,1,1,1,1,1,1,-1,1,1,-1,1,2.39947,-1,-1,2.39947,-1,-1,4.0671,-1,1,4.0671,1,-1,2.39947,1,-1,1,3.15249,-1,1,3.15249,-1,2.39947,-1,1,1,1,-1,2.39947,1,-2.38009,2.39947,1,-2.38009,1,1,1,4.0671,-1,1,4.0671,-1,-1,4.0671,1,-1,4.0671,-1,-1,2.39947,1,-1,2.39947,1,-1,4.0671,-1,-1,4.0671,-1,1,4.0671,1,1,4.0671,1,1,2.39947,1,1,4.0671,1,-1,4.0671,-1,-2.38009,1,1,-2.38009,1,1,-2.38009,2.39947,-1,-2.38009,2.39947,1,-1,2.39947,-1,-1,2.39947,-1,-2.38009,2.39947,1,-2.38009,2.39947,-1,-2.38009,1,-1,-2.38009,2.39947,-1,-1,1,1,-1,1,1,-2.38009,1,-1,-2.38009,1,3.15249,-1,1,3.15249,1,1,3.15249,1,2.39947,3.15249,-1,2.39947,1,-1,1,1,1,1,3.15249,1,1,3.15249,-1,1,1,2.53678,1,3.15249,2.53678,1,1,1,2.39947,1,-1,2.39947,3.15249,-1,2.39947,3.15249,1,2.39947,1,2.53678,1,1,2.53678,2.39947,3.15249,2.53678,2.39947,3.15249,2.53678,1,3.15249,2.53678,1,3.15249,2.53678,2.39947,3.15249,2.53678,2.39947,1,2.53678,2.39947,1,1,1,1,1,2.39947,1,2.53678,2.39947,1,2.53678,1];
  var indices = [2,3,4,2,4,5,6,7,8,6,8,9,39,7,32,32,7,64,39,32,31,31,32,33,32,64,65,31,33,34,10,11,12,10,12,13,14,15,16,14,16,17,16,40,41,16,41,42,40,53,54,40,54,55,18,19,20,18,20,21,22,23,24,22,24,25,25,24,51,25,51,52,35,36,37,35,37,38,43,44,45,43,45,46,47,48,49,47,49,50,56,57,58,56,58,59,60,61,62,60,62,63,66,67,68,66,68,69,70,71,72,70,72,73,72,71,88,72,88,89,74,75,76,74,76,77,76,75,78,76,78,79,80,81,82,80,82,83,80,83,90,80,90,91,84,85,86,84,86,87,92,93,94,92,94,95];

  var vertexBuffer = gl.createBuffer();
  gl.bindBuffer(glArrayBufferConstant, vertexBuffer);
  gl.bufferData(glArrayBufferConstant, new Float32Array(vertices), glStaticDrawConstant);

  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(glElementArrayBufferConstant, indexBuffer);
  gl.bufferData(glElementArrayBufferConstant, new Uint16Array(indices), glStaticDrawConstant);

  gl.bindBuffer(glArrayBufferConstant, vertexBuffer);
  var positionAttributeLocation = gl.getAttribLocation(program, 'vertPosition');
  gl.vertexAttribPointer(
    positionAttributeLocation, // Attribute location
    3, // Number of elements per attribute
    glFloatConstant, // Type of elements (gl.FLOAT)
    glFalse,
    12, // Size of an individual vertex (3 * Float32Array.BYTES_PER_ELEMENT)
    0
  );
  gl.enableVertexAttribArray(positionAttributeLocation);

  var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
	var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
  var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

  // Use shaders
  gl.useProgram(program);

	var worldMatrix = new Float32Array(16);
	var viewMatrix = new Float32Array(16);
  var projMatrix = new Float32Array(16);

	lookAt(viewMatrix, [0, 0, -8], [0, 0, 0], [0, 1, 0]);
	perspective(projMatrix, 0.8, aspectRatio, epsilon, 1e3);

  var uniformMatrix4fv = 'uniformMatrix4fv';
	gl[uniformMatrix4fv](matWorldUniformLocation, glFalse, worldMatrix);
	gl[uniformMatrix4fv](matViewUniformLocation, glFalse, viewMatrix);
	gl[uniformMatrix4fv](matProjUniformLocation, glFalse, projMatrix);

	var xRotationMatrix = new Float32Array(16);
	var yRotationMatrix = new Float32Array(16);

  var testi = " abcdefghijklmnop üýþÿ"
  for(var c in testi) {
    var number = (testi.charCodeAt(c)- 32) / 223
    console.log(c, testi[c], number.toFixed(4), number);
  }

  var angle = 0;
  r = () => {

    window.requestAnimationFrame(r, canvas);

    gl.clearColor(0.6, 0.8, 1, 1)
    // gl.COLOR_BUFFER_BIT | gl.COLOR_BUFFER_BIT == 4**7
    gl.clear(4 ** 7)

      angle = performance.now() / 1e3;
      rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
      rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);
      multiply(worldMatrix, yRotationMatrix, xRotationMatrix);
      gl[uniformMatrix4fv](matWorldUniformLocation, glFalse, worldMatrix);
      gl.drawElements(4, indices.length, 5123, 0); // gl.TRIANGLES = 4, gl.UNSIGNED_SHORT = 5123

    var positionLocation = gl.getAttribLocation(program, 'p');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, glFloatConstant, false, 0, 0);

    var uniformTimeHandle = gl.getUniformLocation(program, 't');
    gl.uniform1f(uniformTimeHandle, new Date().getMilliseconds());

    // gl.TRIANGLES = 4
    gl.drawArrays(4, 0, 6);
  }

  s = () => {
    // sounds
    var audioContext = new AudioContext()
    var o = audioContext.createOscillator()
    o.type = "sawtooth"
    o.connect(audioContext.destination)
    o.frequency.value = 666
    o.start()
  };

  r() // DEBUG
  //setTimeout(() => s(), 0) // DEBUG

  console.log(2 ** 14)
  console.log(~~1.8)
  console.log((() => { var x = Math.sin(new Date().getMilliseconds()) * 10000; return x-~~x;})())

})();
