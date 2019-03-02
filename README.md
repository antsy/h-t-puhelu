# Hätäpuhelu

EcmaScript6/webgl2 4k intro for Instanssi 2019 party.

Run `yarn build` to build.

Open `build\index.html` with Chrome to view. Only tested with latest Vivaldi/Chrome, probably doesn't work with any other browsers.

Requires [effect server](https://github.com/Instanssi/effectserver) and 24 colorful controllable lights to be fully "enjoyed".

## Background

This is actually my first demoparty compo release ever and I learned a lot of new stuff while making it.

For the idea I wish to thank [Alibi magazine](https://alibi.fi/tilaajapalvelut/).

Like any project with a strict deadline it started with planning and ambitions and ended with rush and spaghetti.

### List of useful stuff I studied while making this demo

#### Some neat resources:

* https://github.com/acgessler/assimp2json
* https://skalman.github.io/UglifyJS-online/
* https://github.com/laurentlb/Shader_Minifier
* http://marcgg.com/blog/2016/11/01/javascript-audio/
* https://noisehack.com/generate-noise-web-audio-api/
* https://www.keithmcmillen.com/blog/making-music-in-the-browser-web-audio-api-part-1/
* https://joshondesign.com/p/books/canvasdeepdive/chapter12.html
* http://www.cs.cornell.edu/courses/cs4620/2014fa/lectures/glsl1.pdf
* https://www.youtube.com/watch?v=DhSRvxVQ5HM (WebGL Lighting (2 of 5) - Surface Normals))
* https://www.youtube.com/watch?v=33gn3_khXxw (WebGL Tutorial 05 - Phong Lighting)
* https://www.youtube.com/watch?v=jBqYTgaFDxU (blender basics)
* https://codegolf.stackexchange.com/questions/37624/tips-for-golfing-in-ecmascript-6-and-above
* https://thebookofshaders.com/11/
* https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Creating_3D_objects_using_WebGL
* https://webgl2fundamentals.org/
* https://www.khronos.org/files/webgl20-reference-guide.pdf

* https://medium.com/@omar4ur/flat-shading-in-webgl-with-playcanvas-a-quick-tip-97d1bd85258f
* https://www.shadertoy.com/view/ldf3RN (bokeh blur)
* https://jsfiddle.net/zemmm/y3b054Lk/297/
* http://synth.bitsnbites.eu/
* https://delphic.me.uk/tutorials/webgl-text
* https://github.com/mdn/webgl-examples/blob/gh-pages/tutorial/sample5/webgl-demo.js
* https://gist.github.com/thomaswilburn/6128987

#### Minification/Packing:

* http://www.iteral.com/jscrush/
* https://github.com/cowboy/javascript-packify
* http://crunchme.bitsnbites.eu/
* http://www.pouet.net/prod.php?which=59298
* https://code.google.com/archive/p/jssfx/
* https://github.com/Siorki/RegPack

Oh yeah, you must checkout RegPack to lib-folder to compile the production build. (do `git clone https://github.com/Siorki/RegPack.git`)

