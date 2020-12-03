var board;
var game_loop;

function handleKeyDown(event) {

    handleKeyDown.whichOn = handleKeyDown.whichOn == undefined ? -1 : handleKeyDown.whichOn; // nothing selected initially
    handleKeyDown.modelOn = handleKeyDown.modelOn == undefined ? null : handleKeyDown.modelOn; // nothing selected initially

    switch (event.code) {

        // model selection
        case "Space":
            board.hard_drop()
            redraw(true)
            break;
        case "ArrowRight":
            board.move_right()
            redraw()
            break;
        case "ArrowLeft":
            board.move_left()
            redraw()
            break;
        case "ArrowUp":
            board.rotate()
            redraw()
            break;
        case "ArrowDown":
            var do_redraw = board.drop()
            redraw(do_redraw)
            break;
        case "KeyC":
            board.hold()
            draw_next_piece('hold', board.hold_piece.name)

            redraw(true)
            break;

        case "KeyZ":
            board.rotate(false)
            redraw()
            break;

        case "KeyX":
            board.rotate()
            redraw()
            break;
    }
}

function redraw(redraw_all = false) {

    document.getElementById('score').innerHTML = board.score;

    if (board.game_over) {
        document.getElementById('gameover').innerHTML = "Game Over! Press Retry to Continue";
        clearInterval(game_loop);


    } else {
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

    clear_piece(canvas_id)
    var next_piece = get_tetronmino(tetronmino_name)
    ctxNext.fillStyle = 'rgb(' + next_piece.color[0] * 255 + ',' + next_piece.color[1] * 255 + ',' + next_piece.color[2] * 255 + ')';

    // If piece is I piece, since it's a 5x5 grid, float it up one.
    if (tetronmino_name == "I") {
        for (var i = 1; i < next_piece.shape.length; i++) {
            for (var j = 1; j < next_piece.shape.length; j++) {
                if (next_piece.shape[j][i] > 0) {
                    ctxNext.fillRect(i - 1, j - 1, 1, 1);
                }
            }
        }
    } else {
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

    for (var i = 0; i < 5; i++) {
        for (var j = 0; j < 5; j++) {
            ctxNext.fillRect(i, j, 1, 1);

        }
    }

}

function reset() {
    document.getElementById('gameover').innerHTML = "&nbsp;";

    if (board.game_over) {
        reset_game_loop()
    }
    board.reset()
    clear_piece('hold')
    redraw(true);
    // This is necessray otherwise space will trigger retry again
    document.getElementById('retry').blur();
}

function main() {
    document.onkeydown = handleKeyDown; // call this when key pressed
    board = new Board()
    redraw(true)
    reset_game_loop()

}

function reset_game_loop() {
    function loop() {
        var do_redraw = board.drop();
        redraw(do_redraw)

    }
    game_loop = setInterval(loop, 800);
}

