var board;
var game_loop;
const debug = false

// does stuff when keys are pressed
function handleKeyDown(event) {

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
        case "KeyC": // hold the piece
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



    } // end switch
} // end handleKeyDown

function redraw(redraw_all = false) {

    document.getElementById('score').innerHTML = board.score;

    if (board.game_over) {
        document.getElementById('gameover').innerHTML = "Game Over! Press Retry to Continue";
        clearInterval(game_loop);


    } else {
        //loadModels(board.board, board.get_active_piece_coordinates(), redraw_all);
        board.draw()
    }

    if (redraw_all) {
        draw_next_piece('next', board.bag[6])
        draw_next_piece('next2', board.bag[5])
        draw_next_piece('next3', board.bag[4])
        draw_next_piece('next4', board.bag[3])
        draw_next_piece('next5', board.bag[2])
    }


}

function draw_next_piece(canvas_id, tetronmino_name) {
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
            ctxNext.fillRect(x, y, 1, 1);

        });
    });

    ctxNext.fillStyle = 'rgb(' + next_piece.color[0] * 255 + ',' + next_piece.color[1] * 255 + ',' + next_piece.color[2] * 255 + ')';

    next_piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value > 0) {
                ctxNext.fillRect(x, y, 1, 1);
            }
        });
    });

}

function draw_next_piece(canvas_id, tetronmino_name) {
    var canvasNext = document.getElementById(canvas_id);
    var ctxNext = canvasNext.getContext('2d');
    ctxNext.canvas.width = 5 * 25;
    ctxNext.canvas.height = 5 * 25;
    ctxNext.scale(25, 25);
    ctxNext.fillStyle = 'black';

    clear_piece(canvas_id)
    var next_piece = get_tetronmino(tetronmino_name)
    ctxNext.fillStyle = 'rgb(' + next_piece.color[0] * 255 + ',' + next_piece.color[1] * 255 + ',' + next_piece.color[2] * 255 + ')';

    if(tetronmino_name == "I"){
        for (var i = 1; i < next_piece.shape.length; i++) {
            for (var j = 1; j < next_piece.shape.length; j++) {
                if (next_piece.shape[j][i] > 0) {
                    ctxNext.fillRect(i-1, j-1, 1, 1);
                }
            }
        }
    }
    else {
        for (var i = 0; i < next_piece.shape.length; i++) {
            for (var j = 0; j < next_piece.shape.length; j++) {
                if (next_piece.shape[j][i] > 0) {
                    ctxNext.fillRect(i, j, 1, 1);
                }
            }
        }
    }

}

function clear_piece(canvas_id) {
    var canvasNext = document.getElementById(canvas_id);
    var ctxNext = canvasNext.getContext('2d');
    ctxNext.canvas.width = 5 * 25;
    ctxNext.canvas.height = 5 * 25;
    ctxNext.scale(25, 25);
    ctxNext.fillStyle = 'black';

    for(var i=0; i<5; i++){
        for(var j=0; j<5; j++){
                        ctxNext.fillRect(i, j, 1, 1);

        }
    }

}

function reset() {
    console.log("resetting board")
    document.getElementById('gameover').innerHTML = "&nbsp;";

    if (board.game_over) {

        function loop() {
            var do_redraw = board.drop();
            redraw(do_redraw)

        }

        //game_loop = setInterval(loop, 600);


    }
    board.reset()

    clear_piece('hold')


    redraw(true);

    // This is necessray otherwise space will trigger retry again
    document.getElementById('retry').blur();


}

function main() {
    document.onkeydown = handleKeyDown; // call this when key pressed

    //setupWebGL();

    board = new Board()

    //setupShaders()
    //draw_background()
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

    //game_loop = setInterval(loop, 800);


}

