/* assignment specific globals */
var defaultEye = vec3.fromValues(0, 0, -1.2); // default eye position in world space
var defaultCenter = vec3.fromValues(0, 0, .5); // default view direction in world space
var defaultUp = vec3.fromValues(0, 1, 0); // default view up vector
var lightAmbient = vec3.fromValues(1, 1, 1); // default light ambient emission
var lightDiffuse = vec3.fromValues(1, 1, 1); // default light diffuse emission
var lightSpecular = vec3.fromValues(1, 1, 1); // default light specular emission
var lightPosition = vec3.fromValues(-0.5, 1.5, -0.5); // default light position
var rotateTheta = Math.PI / 50; // how much to rotate models by with each key press

/* webgl and geometry data */
var gl = null; // the all powerful gl object. It's all here folks!
var shaderProgram;
var numTriangleSets = 0; // how many triangle sets in input scene
var inputEllipsoids = []; // the ellipsoid data as loaded from input files
var numberCublets = 0; // how many ellipsoids in the input scene
var vertexBuffers = []; // this contains vertex coordinate lists by set, in triples
var normalBuffers = []; // this contains normal component lists by set, in triples
var triSetSizes = []; // this contains the size of each triangle set
var triangleBuffers = []; // lists of indices into vertexBuffers by set, in triples
var viewDelta = 0; // how much to displace view with each key press


/* shader parameter locations */
var vPosAttribLoc; // where to put position for vertex shader
var mMatrixULoc; // where to put model matrix for vertex shader
var pvmMatrixULoc; // where to put project model view matrix for vertex shader
var ambientULoc; // where to put ambient reflecivity for fragment shader
var diffuseULoc; // where to put diffuse reflecivity for fragment shader
var specularULoc; // where to put specular reflecivity for fragment shader
var shininessULoc; // where to put specular exponent for fragment shader

/* interaction variables */
var Eye = vec3.clone(defaultEye); // eye position in world space
var Center = vec3.clone(defaultCenter); // view direction in world space
var Up = vec3.clone(defaultUp); // view up vector in world space


// ASSIGNMENT HELPER FUNCTIONS


// set up the webGL environment
function setupWebGL() {

    // Set up keys
    document.onkeydown = handleKeyDown; // call this when key pressed


    //var imageCanvas = document.getElementById("myImageCanvas"); // create a 2d canvas
    //imageContext = imageCanvas.getContext("2d");

    //var bkgdImage = new Image();
    //bkgdImage.crossOrigin = "Anonymous";
    // bkgdImage.src = "https://ncsucgclass.github.io/prog3/sky.jpg";
    // bkgdImage.onload = function () {
    //     var iw = bkgdImage.width, ih = bkgdImage.height;
    //     imageContext.drawImage(bkgdImage, 0, 0, iw, ih, 0, 0, cw, ch);
    // }


    // Get the canvas and context
    var canvas = document.getElementById("myWebGLCanvas"); // create a js canvas
    gl = canvas.getContext("webgl"); // get a webgl object from it

    try {
        if (gl == null) {
            throw "unable to create gl context -- is your browser gl ready?";
        } else {
            gl.clearColor(0, 0, 0, 1);

            gl.clearDepth(1.0); // use max when we clear the depth buffer
            gl.enable(gl.DEPTH_TEST); // use hidden surface removal (with zbuffering)
        }
    } // end try

    catch (e) {
        console.log(e);
    } // end catch

} // end setupWebGL

// read models in, load them into webgl buffers
function loadModels(board) {

    // make an ellipsoid, with numLongSteps longitudes.
    // start with a sphere of radius 1 at origin
    // Returns verts, tris and normals.
    function makeCublet() {
        const verticies = [
            // Front face
            0, 0, 0.08,
            0.08, 0, 0.08,
            0.08, 0.08, 0.08,
            0, 0.08, 0.08,

            // Back face
            0, 0, 0,
            0, 0.08, 0,
            0.08, 0.08, 0,
            0.08, 0, 0,

            // Top face
            0, 0.08, 0,
            0, 0.08, 0.08,
            0.08, 0.08, 0.08,
            0.08, 0.08, 0,

            // Bottom face
            0, 0, 0,
            0.08, 0, 0,
            0.08, 0, 0.08,
            0, 0, 0.08,

            // Right face
            0.08, 0, 0,
            0.08, 0.08, 0,
            0.08, 0.08, 0.08,
            0.08, 0, 0.08,

            // Left face
            0, 0, 0,
            0, 0, 0.08,
            0, 0.08, 0.08,
            0, 0.08, 0,
        ];


        const normals = [
            // Front
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,

            // Back
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,

            // Top
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,

            // Bottom
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,

            // Right
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,

            // Left
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0
        ];

        const indices = [
            0, 1, 2, 0, 2, 3,    // front
            4, 5, 6, 4, 6, 7,    // back
            8, 9, 10, 8, 10, 11,   // top
            12, 13, 14, 12, 14, 15,   // bottom
            16, 17, 18, 16, 18, 19,   // right
            20, 21, 22, 20, 22, 23,   // left
        ];


        return ({vertices: verticies, normals: normals, triangles: indices});


    } // end make ellipsoid



    // make an ellipsoid, with numLongSteps longitudes.
    // start with a sphere of radius 1 at origin
    // Returns verts, tris and normals.
    function makeBackground() {
        const verticies = [

            // Back face
            -1, -1, 0,
            -1, 1, 0,
            1, 1, 0,
            1, -1, 0,


        ];


        const normals = [
            // Back
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,


        ];

        const indices = [
            0, 1, 2, 2, 3, 0,
        ];


        return ({vertices: verticies, normals: normals, triangles: indices});


    } // end make ellipsoid


    // init ellipsoid highlighting, translation and rotation; update bbox
    var cublet; // current ellipsoid
    var cubletModel; // current cublet triangular model


    numberCublets = 0;
  //
  //   var backgroundModel = makeBackground(); //background triangle model
  //   var background = {
  //                   translation: vec3.fromValues(0,0, -.1),
  //                   ambient: [1,1,1],
  //                   diffuse: [1, 1, 1],
  //                   specular: [0, 0, 0],
  //                   n: 11,
  //                   xAxis: vec3.fromValues(1, 0, 0),
  //                   yAxis: vec3.fromValues(0, 1, 0),
  //                   center: vec3.fromValues(0, 0, 0),
  //                   on: false
  //
  //               }
  //               inputEllipsoids[numberCublets] = background
  //
  // // send the ellipsoid vertex coords and normals to webGL
  //   vertexBuffers.push(gl.createBuffer()); // init empty webgl ellipsoid vertex coord buffer
  //   gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers[vertexBuffers.length - 1]); // activate that buffer
  //   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(backgroundModel.vertices), gl.STATIC_DRAW); // data in
  //   normalBuffers.push(gl.createBuffer()); // init empty webgl ellipsoid vertex normal buffer
  //   gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffers[normalBuffers.length - 1]); // activate that buffer
  //   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(backgroundModel.normals), gl.STATIC_DRAW); // data in
  //
  //   triSetSizes.push(backgroundModel.triangles.length);
  //
  //   // send the triangle indices to webGL
  //   triangleBuffers.push(gl.createBuffer()); // init empty triangle index buffer
  //   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffers[triangleBuffers.length - 1]); // activate that buffer
  //   gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(backgroundModel.triangles), gl.STATIC_DRAW); // data in
  //
  //   numberCublets++;


    board.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value != 0) {
                cublet = {
                    translation: vec3.fromValues((5 - x) / 10, (10 - y) / 10, 0),
                    ambient: value,
                    diffuse: [1, 1, 1],
                    specular: [.3, .3, .3],
                    n: 11,
                    xAxis: vec3.fromValues(1, 0, 0),
                    yAxis: vec3.fromValues(0, 1, 0),
                    center: vec3.fromValues(0, 0, 0),
                    on: false,
                    alpha: 0.9

                }
                inputEllipsoids[numberCublets] = cublet


                // make the ellipsoid model
                cubletModel = makeCublet();

                // send the ellipsoid vertex coords and normals to webGL
                vertexBuffers.push(gl.createBuffer()); // init empty webgl ellipsoid vertex coord buffer
                gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers[vertexBuffers.length - 1]); // activate that buffer
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubletModel.vertices), gl.STATIC_DRAW); // data in
                normalBuffers.push(gl.createBuffer()); // init empty webgl ellipsoid vertex normal buffer
                gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffers[normalBuffers.length - 1]); // activate that buffer
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubletModel.normals), gl.STATIC_DRAW); // data in

                triSetSizes.push(cubletModel.triangles.length);

                // send the triangle indices to webGL
                triangleBuffers.push(gl.createBuffer()); // init empty triangle index buffer
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffers[triangleBuffers.length - 1]); // activate that buffer
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubletModel.triangles), gl.STATIC_DRAW); // data in

                numberCublets++;

            }

            else {
                cublet = {
                    translation: vec3.fromValues((5 - x) / 10, (10 - y) / 10, 0),
                    ambient: [.1,.1,.1],
                    diffuse: [.05,.05,.05],
                    specular: [0, 0, 0],
                    n: 0,
                    xAxis: vec3.fromValues(1, 0, 0),
                    yAxis: vec3.fromValues(0, 1, 0),
                    center: vec3.fromValues(0, 0, 0),
                    on: false,
                    alpha: 0.9

                }
                inputEllipsoids[numberCublets] = cublet


                // make the ellipsoid model
                cubletModel = makeCublet();

                // send the ellipsoid vertex coords and normals to webGL
                vertexBuffers.push(gl.createBuffer()); // init empty webgl ellipsoid vertex coord buffer
                gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers[vertexBuffers.length - 1]); // activate that buffer
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubletModel.vertices), gl.STATIC_DRAW); // data in
                normalBuffers.push(gl.createBuffer()); // init empty webgl ellipsoid vertex normal buffer
                gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffers[normalBuffers.length - 1]); // activate that buffer
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubletModel.normals), gl.STATIC_DRAW); // data in

                triSetSizes.push(cubletModel.triangles.length);

                // send the triangle indices to webGL
                triangleBuffers.push(gl.createBuffer()); // init empty triangle index buffer
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffers[triangleBuffers.length - 1]); // activate that buffer
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubletModel.triangles), gl.STATIC_DRAW); // data in

                numberCublets++;

            }
        });
    });

    viewDelta = .05//vec3.length(vec3.subtract(temp, maxCorner, minCorner)) / 100; // set global

} // end load models

// setup the webGL shaders
function setupShaders() {

    // define vertex shader in essl using es6 template strings
    var vShaderCode = `
        attribute vec3 aVertexPosition; // vertex position
        attribute vec3 aVertexNormal; // vertex normal
        
        uniform mat4 umMatrix; // the model matrix
        uniform mat4 upvmMatrix; // the project view model matrix
        
        varying vec3 vWorldPos; // interpolated world position of vertex
        varying vec3 vVertexNormal; // interpolated normal for frag shader

        void main(void) {
            
            // vertex position
            vec4 vWorldPos4 = umMatrix * vec4(aVertexPosition, 1.0);
            vWorldPos = vec3(vWorldPos4.x,vWorldPos4.y,vWorldPos4.z);
            gl_Position = upvmMatrix * vec4(aVertexPosition, 1.0);

            // vertex normal (assume no non-uniform scale)
            vec4 vWorldNormal4 = umMatrix * vec4(aVertexNormal, 0.0);
            vVertexNormal = normalize(vec3(vWorldNormal4.x,vWorldNormal4.y,vWorldNormal4.z)); 
        }
    `;

    // define fragment shader in essl using es6 template strings
    var fShaderCode = `
        precision mediump float; // set float to medium precision

        // eye location
        uniform vec3 uEyePosition; // the eye's position in world
        
        // light properties
        uniform vec3 uLightAmbient; // the light's ambient color
        uniform vec3 uLightDiffuse; // the light's diffuse color
        uniform vec3 uLightSpecular; // the light's specular color
        uniform vec3 uLightPosition; // the light's position
        
        // material properties
        uniform vec3 uAmbient; // the ambient reflectivity
        uniform vec3 uDiffuse; // the diffuse reflectivity
        uniform vec3 uSpecular; // the specular reflectivity
        uniform float uShininess; // the specular exponent
        
        uniform float uAlpha;

        
        // geometry properties
        varying vec3 vWorldPos; // world xyz of fragment
        varying vec3 vVertexNormal; // normal of fragment
            
        void main(void) {
        
            // ambient term
            vec3 ambient = uAmbient*uLightAmbient; 
            
            // diffuse term
            vec3 normal = normalize(vVertexNormal); 
            vec3 light = normalize(uLightPosition - vWorldPos);
            float lambert = max(0.0,dot(normal,light));
            vec3 diffuse = uDiffuse*uLightDiffuse*lambert; // diffuse term
            
            // specular term
            vec3 eye = normalize(uEyePosition - vWorldPos);
            vec3 halfVec = normalize(light+eye);
            float highlight = pow(max(0.0,dot(normal,halfVec)),uShininess);
            vec3 specular = uSpecular*uLightSpecular*highlight; // specular term
            
            // combine to output color
            vec3 colorOut = ambient + diffuse + specular; // no specular yet
            gl_FragColor = vec4(colorOut, uAlpha); 
            
        }
    `;

    try {
        var fShader = gl.createShader(gl.FRAGMENT_SHADER); // create frag shader
        gl.shaderSource(fShader, fShaderCode); // attach code to shader
        gl.compileShader(fShader); // compile the code for gpu execution

        var vShader = gl.createShader(gl.VERTEX_SHADER); // create vertex shader
        gl.shaderSource(vShader, vShaderCode); // attach code to shader
        gl.compileShader(vShader); // compile the code for gpu execution

        if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) { // bad frag shader compile
            throw "error during fragment shader compile: " + gl.getShaderInfoLog(fShader);
            gl.deleteShader(fShader);
        } else if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) { // bad vertex shader compile
            throw "error during vertex shader compile: " + gl.getShaderInfoLog(vShader);
            gl.deleteShader(vShader);
        } else { // no compile errors
            shaderProgram = gl.createProgram(); // create the single shader program
            gl.attachShader(shaderProgram, fShader); // put frag shader in program
            gl.attachShader(shaderProgram, vShader); // put vertex shader in program
            gl.linkProgram(shaderProgram); // link program into gl context

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) { // bad program link
                throw "error during shader program linking: " + gl.getProgramInfoLog(shaderProgram);
            } else { // no shader program link errors
                gl.useProgram(shaderProgram); // activate shader program (frag and vert)

                // locate and enable vertex attributes
                vPosAttribLoc = gl.getAttribLocation(shaderProgram, "aVertexPosition"); // ptr to vertex pos attrib
                gl.enableVertexAttribArray(vPosAttribLoc); // connect attrib to array
                vNormAttribLoc = gl.getAttribLocation(shaderProgram, "aVertexNormal"); // ptr to vertex normal attrib
                gl.enableVertexAttribArray(vNormAttribLoc); // connect attrib to array

                // locate vertex uniforms
                mMatrixULoc = gl.getUniformLocation(shaderProgram, "umMatrix"); // ptr to mmat
                pvmMatrixULoc = gl.getUniformLocation(shaderProgram, "upvmMatrix"); // ptr to pvmmat


                shaderProgram.alphaUniform = gl.getUniformLocation(shaderProgram, "uAlpha");


                // locate fragment uniforms
                var eyePositionULoc = gl.getUniformLocation(shaderProgram, "uEyePosition"); // ptr to eye position
                var lightAmbientULoc = gl.getUniformLocation(shaderProgram, "uLightAmbient"); // ptr to light ambient
                var lightDiffuseULoc = gl.getUniformLocation(shaderProgram, "uLightDiffuse"); // ptr to light diffuse
                var lightSpecularULoc = gl.getUniformLocation(shaderProgram, "uLightSpecular"); // ptr to light specular
                var lightPositionULoc = gl.getUniformLocation(shaderProgram, "uLightPosition"); // ptr to light position
                ambientULoc = gl.getUniformLocation(shaderProgram, "uAmbient"); // ptr to ambient
                diffuseULoc = gl.getUniformLocation(shaderProgram, "uDiffuse"); // ptr to diffuse
                specularULoc = gl.getUniformLocation(shaderProgram, "uSpecular"); // ptr to specular
                shininessULoc = gl.getUniformLocation(shaderProgram, "uShininess"); // ptr to shininess

                // pass global constants into fragment uniforms
                gl.uniform3fv(eyePositionULoc, Eye); // pass in the eye's position
                gl.uniform3fv(lightAmbientULoc, lightAmbient); // pass in the light's ambient emission
                gl.uniform3fv(lightDiffuseULoc, lightDiffuse); // pass in the light's diffuse emission
                gl.uniform3fv(lightSpecularULoc, lightSpecular); // pass in the light's specular emission
                gl.uniform3fv(lightPositionULoc, lightPosition); // pass in the light's position
            } // end if no shader program link errors
        } // end if no compile errors
    } // end try

    catch (e) {
        console.log(e);
    } // end catch
} // end setup shaders

// render the loaded model
function renderModels() {

    // construct the model transform matrix, based on model state
    function makeModelTransform(currModel) {
        var zAxis = vec3.create(), sumRotation = mat4.create(), temp = mat4.create(), negCtr = vec3.create();

        // move the model to the origin
        mat4.fromTranslation(mMatrix, vec3.negate(negCtr, currModel.center));

        // scale for highlighting if needed
        if (currModel.on)
            mat4.multiply(mMatrix, mat4.fromScaling(temp, vec3.fromValues(1.2, 1.2, 1.2)), mMatrix); // S(1.2) * T(-ctr)

        // rotate the model to current interactive orientation
        vec3.normalize(zAxis, vec3.cross(zAxis, currModel.xAxis, currModel.yAxis)); // get the new model z axis
        mat4.set(sumRotation, // get the composite rotation
            currModel.xAxis[0], currModel.yAxis[0], zAxis[0], 0,
            currModel.xAxis[1], currModel.yAxis[1], zAxis[1], 0,
            currModel.xAxis[2], currModel.yAxis[2], zAxis[2], 0,
            0, 0, 0, 1);
        mat4.multiply(mMatrix, sumRotation, mMatrix); // R(ax) * S(1.2) * T(-ctr)

        // translate back to model center
        mat4.multiply(mMatrix, mat4.fromTranslation(temp, currModel.center), mMatrix); // T(ctr) * R(ax) * S(1.2) * T(-ctr)

        // translate model to current interactive orientation
        mat4.multiply(mMatrix, mat4.fromTranslation(temp, currModel.translation), mMatrix); // T(pos)*T(ctr)*R(ax)*S(1.2)*T(-ctr)

    } // end make model transform

    // var hMatrix = mat4.create(); // handedness matrix
    var pMatrix = mat4.create(); // projection matrix
    var vMatrix = mat4.create(); // view matrix
    var mMatrix = mat4.create(); // model matrix
    var pvMatrix = mat4.create(); // hand * proj * view matrices
    var pvmMatrix = mat4.create(); // hand * proj * view * model matrices

    window.requestAnimationFrame(renderModels); // set up frame render callback

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear frame/depth buffers

    // set up projection and view
    // mat4.fromScaling(hMatrix,vec3.fromValues(-1,1,1)); // create handedness matrix
    mat4.perspective(pMatrix, 0.5 * Math.PI, 1, 0.1, 10); // create projection matrix
    mat4.lookAt(vMatrix, Eye, Center, Up); // create view matrix
    mat4.multiply(pvMatrix, pvMatrix, pMatrix); // projection
    mat4.multiply(pvMatrix, pvMatrix, vMatrix); // projection * view


    // render each ellipsoid
    //var ellipsoid, instanceTransform = mat4.create(); // the current ellipsoid and material



    for (var whichEllipsoid = 0; whichEllipsoid < numberCublets; whichEllipsoid++) {
        var ellipsoid = inputEllipsoids[whichEllipsoid];

        // define model transform, premult with pvmMatrix, feed to vertex shader
        makeModelTransform(ellipsoid);
        pvmMatrix = mat4.multiply(pvmMatrix, pvMatrix, mMatrix); // premultiply with pv matrix
        gl.uniformMatrix4fv(mMatrixULoc, false, mMatrix); // pass in model matrix
        gl.uniformMatrix4fv(pvmMatrixULoc, false, pvmMatrix); // pass in project view model matrix

        // reflectivity: feed to the fragment shader
        gl.uniform3fv(ambientULoc, ellipsoid.ambient); // pass in the ambient reflectivity
        gl.uniform3fv(diffuseULoc, ellipsoid.diffuse); // pass in the diffuse reflectivity
        gl.uniform3fv(specularULoc, ellipsoid.specular); // pass in the specular reflectivity
        gl.uniform1f(shininessULoc, ellipsoid.n); // pass in the specular exponent

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers[numTriangleSets + whichEllipsoid]); // activate vertex buffer
        gl.vertexAttribPointer(vPosAttribLoc, 3, gl.FLOAT, false, 0, 0); // feed vertex buffer to shader
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffers[numTriangleSets + whichEllipsoid]); // activate normal buffer
        gl.vertexAttribPointer(vNormAttribLoc, 3, gl.FLOAT, false, 0, 0); // feed normal buffer to shader
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffers[numTriangleSets + whichEllipsoid]); // activate tri buffer

        // draw a transformed instance of the ellipsoid
        gl.drawElements(gl.TRIANGLES, triSetSizes[numTriangleSets + whichEllipsoid], gl.UNSIGNED_SHORT, 0); // render
        gl.uniform1f(shaderProgram.alphaUniform, ellipsoid.alpha);


    } // end for each ellipsoid


} // end render model
