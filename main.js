
var board;
var game_loop;
const debug=false

// does stuff when keys are pressed
function handleKeyDown(event) {

    const modelEnum = {TRIANGLES: "triangles", ELLIPSOID: "ellipsoid"}; // enumerated model type
    const dirEnum = {NEGATIVE: -1, POSITIVE: 1}; // enumerated rotation direction

    function highlightModel(modelType, whichModel) {
        if(debug){
        if (handleKeyDown.modelOn != null)
            handleKeyDown.modelOn.on = false;
        handleKeyDown.whichOn = whichModel;
        if (modelType == modelEnum.TRIANGLES)
            handleKeyDown.modelOn = inputTriangles[whichModel];
        else
            handleKeyDown.modelOn = inputEllipsoids[whichModel];
        handleKeyDown.modelOn.on = true;
        }
    } // end highlight model

    function translateModel(offset) {
        if(debug) {
            if (handleKeyDown.modelOn != null)
                vec3.add(handleKeyDown.modelOn.translation, handleKeyDown.modelOn.translation, offset);
        }
    } // end translate model

    function rotateModel(axis, direction) {
        if (debug) {
            if (handleKeyDown.modelOn != null) {
                var newRotation = mat4.create();

                mat4.fromRotation(newRotation, direction * rotateTheta, axis); // get a rotation matrix around passed axis
                vec3.transformMat4(handleKeyDown.modelOn.xAxis, handleKeyDown.modelOn.xAxis, newRotation); // rotate model x axis tip
                vec3.transformMat4(handleKeyDown.modelOn.yAxis, handleKeyDown.modelOn.yAxis, newRotation); // rotate model y axis tip
            } // end if there is a highlighted model
        } // end rotate model
    }
    // set up needed view params
    var lookAt = vec3.create(), viewRight = vec3.create(), temp = vec3.create(); // lookat, right & temp vectors
    lookAt = vec3.normalize(lookAt, vec3.subtract(temp, Center, Eye)); // get lookat vector
    viewRight = vec3.normalize(viewRight, vec3.cross(temp, lookAt, Up)); // get view right vector

    // highlight static variables
    handleKeyDown.whichOn = handleKeyDown.whichOn == undefined ? -1 : handleKeyDown.whichOn; // nothing selected initially
    handleKeyDown.modelOn = handleKeyDown.modelOn == undefined ? null : handleKeyDown.modelOn; // nothing selected initially

    switch (event.code) {

        // model selection
        case "Space":
            board.hard_drop()
            redraw()
            break;
        case "ArrowRight": // select next triangle set
           board.move_right()
            redraw()
            break;
        case "ArrowLeft": // select previous triangle set
            board.move_left()
            redraw()
            break;
        case "ArrowUp": // select next ellipsoid
            highlightModel(modelEnum.ELLIPSOID, (handleKeyDown.whichOn + 1) % numberCublets);
            break;
        case "ArrowDown": // select previous ellipsoid
            board.drop()
            redraw()
            highlightModel(modelEnum.ELLIPSOID, (handleKeyDown.whichOn > 0) ? handleKeyDown.whichOn - 1 : numberCublets - 1);
            break;

        // view change
        case "KeyA": // translate view left, rotate left with shift
            Center = vec3.add(Center, Center, vec3.scale(temp, viewRight, viewDelta));
            if (!event.getModifierState("Shift"))
                Eye = vec3.add(Eye, Eye, vec3.scale(temp, viewRight, viewDelta));
            break;
        case "KeyD": // translate view right, rotate right with shift
            Center = vec3.add(Center, Center, vec3.scale(temp, viewRight, -viewDelta));
            if (!event.getModifierState("Shift"))
                Eye = vec3.add(Eye, Eye, vec3.scale(temp, viewRight, -viewDelta));
            break;
        case "KeyS": // translate view backward, rotate up with shift
            if (event.getModifierState("Shift")) {
                Center = vec3.add(Center, Center, vec3.scale(temp, Up, viewDelta));
                Up = vec3.cross(Up, viewRight, vec3.subtract(lookAt, Center, Eye)); /* global side effect */
            } else {
                Eye = vec3.add(Eye, Eye, vec3.scale(temp, lookAt, -viewDelta));
                Center = vec3.add(Center, Center, vec3.scale(temp, lookAt, -viewDelta));
            } // end if shift not pressed
            break;
        case "KeyW": // translate view forward, rotate down with shift
            if (event.getModifierState("Shift")) {
                Center = vec3.add(Center, Center, vec3.scale(temp, Up, -viewDelta));
                Up = vec3.cross(Up, viewRight, vec3.subtract(lookAt, Center, Eye)); /* global side effect */
            } else {
                Eye = vec3.add(Eye, Eye, vec3.scale(temp, lookAt, viewDelta));
                Center = vec3.add(Center, Center, vec3.scale(temp, lookAt, viewDelta));
            } // end if shift not pressed
            break;
        case "KeyQ": // translate view up, rotate counterclockwise with shift
            if (event.getModifierState("Shift"))
                Up = vec3.normalize(Up, vec3.add(Up, Up, vec3.scale(temp, viewRight, -viewDelta)));
            else {
                Eye = vec3.add(Eye, Eye, vec3.scale(temp, Up, viewDelta));
                Center = vec3.add(Center, Center, vec3.scale(temp, Up, viewDelta));
            } // end if shift not pressed
            break;
        case "KeyE": // translate view down, rotate clockwise with shift
            if (event.getModifierState("Shift"))
                Up = vec3.normalize(Up, vec3.add(Up, Up, vec3.scale(temp, viewRight, viewDelta)));
            else {
                Eye = vec3.add(Eye, Eye, vec3.scale(temp, Up, -viewDelta));
                Center = vec3.add(Center, Center, vec3.scale(temp, Up, -viewDelta));
            } // end if shift not pressed
            break;
        case "Escape": // reset view to default
            Eye = vec3.copy(Eye, defaultEye);
            Center = vec3.copy(Center, defaultCenter);
            Up = vec3.copy(Up, defaultUp);
            break;

        // model transformation
        case "KeyK": // translate left, rotate left with shift
            if (event.getModifierState("Shift"))
                rotateModel(Up, dirEnum.NEGATIVE);
            else
                translateModel(vec3.scale(temp, viewRight, viewDelta));
            break;
        case "Semicolon": // translate right, rotate right with shift
            if (event.getModifierState("Shift"))
                rotateModel(Up, dirEnum.POSITIVE);
            else
                translateModel(vec3.scale(temp, viewRight, -viewDelta));
            break;
        case "KeyL": // translate backward, rotate up with shift
            if (event.getModifierState("Shift"))
                rotateModel(viewRight, dirEnum.POSITIVE);
            else
                translateModel(vec3.scale(temp, lookAt, -viewDelta));
            break;
        case "KeyO": // translate forward, rotate down with shift
            if (event.getModifierState("Shift"))
                rotateModel(viewRight, dirEnum.NEGATIVE);
            else
                translateModel(vec3.scale(temp, lookAt, viewDelta));
            break;
        case "KeyI": // translate up, rotate counterclockwise with shift
            if (event.getModifierState("Shift"))
                rotateModel(lookAt, dirEnum.POSITIVE);
            else
                translateModel(vec3.scale(temp, Up, viewDelta));
            break;
        case "KeyP": // translate down, rotate clockwise with shift
            if (event.getModifierState("Shift"))
                rotateModel(lookAt, dirEnum.NEGATIVE);
            else
                translateModel(vec3.scale(temp, Up, -viewDelta));
            break;
        case "Backspace": // reset model transforms to default
            for (var whichTriSet = 0; whichTriSet < numTriangleSets; whichTriSet++) {
                vec3.set(inputTriangles[whichTriSet].translation, 0, 0, 0);
                vec3.set(inputTriangles[whichTriSet].xAxis, 1, 0, 0);
                vec3.set(inputTriangles[whichTriSet].yAxis, 0, 1, 0);
            } // end for all triangle sets
            for (var whichEllipsoid = 0; whichEllipsoid < numberCublets; whichEllipsoid++) {
                vec3.set(inputEllipsoids[whichEllipsoid].translation, 0, 0, 0);
                vec3.set(inputEllipsoids[whichTriSet].xAxis, 1, 0, 0);
                vec3.set(inputEllipsoids[whichTriSet].yAxis, 0, 1, 0);
            } // end for all ellipsoids
            break;
        case "KeyB":
            if (modulate) {
                modulate = false;
            } else {
                modulate = true
            }
            break;

    } // end switch
} // end handleKeyDown

function redraw(){
            loadModels(board.board);
        renderModels()
    if(board.game_over){

        alert("Game Over!")
          clearInterval(game_loop);

    }

}


function main() {
    document.onkeydown = handleKeyDown; // call this when key pressed

    setupWebGL();

    board = new Board()

    setupShaders()
    redraw()

    // for each time tick, update board,
    // keep camera stuff
    // clear webgl
    // rerender webgl
    // for each cube,
    //      generate buffer,
    //      render

    // Vertex shader program

//    drawScene(gl, programInfo, buffers, deltaTime);



  function loop() {
    board.drop();
    redraw()

  }

  game_loop = setInterval(loop, 500);





}
