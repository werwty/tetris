var board;
var game_loop;
const debug = false

// does stuff when keys are pressed
function handleKeyDown(event) {

    const dirEnum = {NEGATIVE: -1, POSITIVE: 1}; // enumerated rotation direction


    function translateModel(offset) {
        if (debug) {
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
            redraw(true)
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
            board.rotate()
            redraw()
            break;
        case "ArrowDown": // select previous ellipsoid
            var do_redraw = board.drop()
            redraw(do_redraw)
            break;
            case "KeyH": // hold the piece
                board.hold()
        draw_next_piece('hold', board.hold_piece.name)

            redraw(true)
            break;

                        case "KeyZ": // select next ellipsoid
            board.rotate(false)
            redraw()
            break;

                        case "KeyX": // select next ellipsoid
            board.rotate()
            redraw()
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


    } // end switch
} // end handleKeyDown

function redraw(redraw_all = false) {
    document.getElementById('score').innerHTML = board.score;

    if (board.game_over) {
        document.getElementById('gameover').innerHTML = "Game Over! Press Retry to Continue";

        clearInterval(game_loop);

    } else {
        loadModels(board.board, board.get_active_piece_coordinates(), redraw_all);
        renderModels()
    }

    if(redraw_all) {
        draw_next_piece('next', board.bag[6])
        draw_next_piece('next2', board.bag[5])
        draw_next_piece('next3', board.bag[4])
        draw_next_piece('next4', board.bag[3])
        draw_next_piece('next5', board.bag[2])
    }



}

function draw_next_piece(canvas_id, tetronmino_name){
    var canvasNext = document.getElementById(canvas_id);
    var ctxNext = canvasNext.getContext('2d');
    ctxNext.canvas.width = 5 * 25;
    ctxNext.canvas.height = 5 * 25;
    ctxNext.scale(25, 25);
    ctxNext.fillStyle = 'black';
    ctxNext.fillRect(1, 1, 1, 1);

    var next_piece = get_tetronmino(tetronmino_name)
    next_piece.shape.forEach((row, y) => {
       row.forEach((value, x) => {
           ctxNext.fillRect( x,  y, 1, 1);

       });
     });

    ctxNext.fillStyle = 'rgb('+ next_piece.color[0]*255+ ',' + next_piece.color[1]*255 + ',' + next_piece.color[2]*255 + ')';

    next_piece.shape.forEach((row, y) => {
       row.forEach((value, x) => {
         if (value > 0) {
           ctxNext.fillRect( x,  y, 1, 1);
         }
       });
     });

}
function reset() {
    console.log("resetting board")
    document.getElementById('gameover').innerHTML = "&nbsp;";

    if (board.game_over) {

        function loop() {
            var do_redraw = board.drop();
            redraw(do_redraw)

        }

        game_loop = setInterval(loop, 600);


    }
    board.reset()

    board.new_piece()
    board.game_over = false
    board.score = 0

    redraw(true);

    // This is necessray otherwise space will trigger retry again
    document.getElementById('retry').blur();


}

function main() {
    document.onkeydown = handleKeyDown; // call this when key pressed

    setupWebGL();

    board = new Board()

    setupShaders()
    draw_background()
    redraw(true)

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
        var do_redraw = board.drop();
        redraw(do_redraw)

    }

    game_loop = setInterval(loop, 600);


}
