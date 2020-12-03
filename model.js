var offsets_jlstz = {
    '0': [
        [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]
    ],
    'R': [
        [0, 0], [1, 0], [1, -1], [0, 2], [1, 2]

    ],
    '2': [
        [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]
    ],
    'L': [
        [0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]
    ],

}

var offsets_i = {
    '0': [
        [0, 0], [-1, 0], [2, 0], [-1, 0], [2, 0]
    ],
    'R': [
        [-1, 0], [0, 0], [0, 0], [0, 1], [0, -2]

    ],
    '2': [
        [-1, 1], [1, 1], [-2, 1], [1, 0], [-2, 0]
    ],
    'L': [
        [0, 1], [0, 1], [0, 1], [0, -1], [0, 2]
    ],

}

var orientations = ['0', 'R', '2', 'L']

var default_bag = ['I', 'T', 'L', 'J', 'S', 'Z', 'O']

var tetrominos = [
    {
        'name': 'I',
        'shape': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 1, 1, 1, 1], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]],
        'color': [49 / 255, 179 / 255, 211 / 255],
        'orientation': orientations[0]

    },
    {
        'name': 'T',
        'shape': [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
        'color': [140 / 255, 0 / 255, 184 / 255],
        'orientation': orientations[0]

    },
    {
        'name': 'L',
        'shape': [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
        'color': [237 / 255, 151 / 255, 31 / 255],
        'orientation': orientations[0]

    },
    {
        'name': 'J',
        'shape': [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
        'color': [47 / 255, 49 / 255, 209 / 255],
        'orientation': orientations[0]
    },
    {
        'name': 'Z',
        'shape': [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
        'color': [206 / 255, 26 / 255, 26 / 255],
        'orientation': orientations[0]
    },
    {
        'name': 'S',
        'shape': [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
        'color': [17 / 255, 184 / 255, 0 / 255],
        'orientation': orientations[0]
    },
    {
        'name': 'O',
        'shape': [[0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]],
        'color': [1, 209 / 255, 0],
        'orientation': orientations[0]
    }]

function get_tetronmino(name) {
    for (var i = 0; i < tetrominos.length; i++) {
        var tetromino = tetrominos[i];
        if (tetromino.name == name) {
            return tetromino
        }
    }
}

function get_permutated_bag() {
    var bag = JSON.parse(JSON.stringify(default_bag))
    for (var i = bag.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = bag[i];
        bag[i] = bag[j];
        bag[j] = temp;
    }
    return bag

}

class Board {
    constructor() {
        this.board_height = 21
        this.board_width = 10
        this.reset()

    }

    new_piece() {
        this.active_piece = new Tetromino(this.bag.pop())
        this.bag.unshift(this.next_bag.pop())
        if (this.next_bag.length == 0) {
            this.next_bag = get_permutated_bag()
        }
        var lines_cleared = this.clear_lines()
        this.score = this.score + lines_cleared;
        this.active_x = 4
        this.active_y = 1


        if (this.valid_move(this.active_x, this.active_y)) {
            this.load_piece()
        }

        else {
            this.game_over = true
        }
    }

    hold() {

        this.clear_piece();

        if (this.hold_piece == null) {
            this.hold_piece = this.active_piece;
            this.new_piece()
        } else {
            var temp = this.hold_piece;
            this.active_piece.reset()
            this.hold_piece = this.active_piece;
            this.active_piece = temp
            this.active_x = 4
            this.active_y = 1
        }

        this.load_piece()
    }

    clear_lines() {
        var number_lines_cleared = 0;
        for (var y = 0; y < this.board_height; y++) {
            var line_clear = true
            for (var x = 0; x < this.board_width; x++) {
                if (this.board[y][x] == 0) {
                    line_clear = false
                }
            }
            if (line_clear) {
                number_lines_cleared++

                for (var j = y; j > 0; j--) {
                    this.board[j] = JSON.parse(JSON.stringify(this.board[j - 1]))
                }
                this.board[0] = Array(this.board_width).fill(0)
            }
        }
        return number_lines_cleared
    }

    // Reset board to empty array
    reset() {
        this.board = Array.from(
            {length: this.board_height}, () => Array(this.board_width).fill(0)
        );
        this.bag = get_permutated_bag()
        this.next_bag = get_permutated_bag()
        this.game_over = false
        this.score = 0
        this.hold_piece = null
                this.new_piece()



    }

    load_piece() {
        this.active_piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {

                if (value != 0) {
                    this.board[this.active_y + y-Math.floor(this.active_piece.shape.length/2)][this.active_x + x-Math.floor(row.length/2)] = this.active_piece.color
                }
            });
        });
    }

    clear_piece() {
        this.active_piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {

                if (value != 0) {
                    var test_y = Math.max(this.active_y + y-Math.floor(this.active_piece.shape.length/2),0)
                    var test_x = Math.max(this.active_x + x-Math.floor(row.length/2), 0)
                    this.board[test_y][test_x] = 0;
                }
            });
        });
    }

    hard_drop() {
        this.clear_piece();
        var max_y = 0
        for (var y = this.active_y; y < this.board_height; y++) {

            if (this.valid_move(this.active_x, y)) {
                max_y = y
            } else {
                break;
            }
        }
        this.active_y = max_y
        this.load_piece()
        this.new_piece()
        return;
    }

    drop() {
        var do_redraw = false
        this.clear_piece();

        if (this.valid_move(this.active_x, this.active_y + 1)) {
            this.active_y++
            this.load_piece()
        } else {
            this.load_piece()

            this.new_piece()
            do_redraw = true
        }
        return do_redraw
    }

    valid_move(temp_x, temp_y, piece = this.active_piece) {


        for (var y = 0; y < piece.shape.length; y++) {
            for (var x = 0; x < piece.shape[y].length; x++) {

                var value = piece.shape[y][x]
                var test_y = temp_y +y - Math.floor(piece.shape.length/2)
                var test_x = temp_x +x - Math.floor(piece.shape[y].length/2)

                if (value != 0) {
                    // Check for board collision
                    if (test_x> this.board_width || test_x < 0 || test_y>= this.board_height) {
                        return false
                    }

                    if (this.board[test_y][test_x] != 0) {
                        console.log("move not valid")
                                            // check for piece collision
                    console.log("y is "+test_y)
                    console.log("x is "+test_x)
                        return false

                    }
                }
            }
        }
        return true
    }

    move_left() {
        this.clear_piece();

        if (this.valid_move(this.active_x - 1, this.active_y)) {
            this.active_x--

        }
        this.load_piece()
    }

    move_right() {
        this.clear_piece();

        if (this.valid_move(this.active_x + 1, this.active_y)) {
            this.active_x++

        }
        this.load_piece()
    }

    rotate(clockwise = true) {
        function get_rotated_offsets(rotated_orientation, active_orientation, offset, name) {
            var offset_rotated;
            var offset_active;
            if (name == 'I') {
                offset_rotated = offsets_i[rotated_orientation][offset]
                offset_active = offsets_i[active_orientation][offset]

            } else {
                offset_rotated = offsets_jlstz[rotated_orientation][offset]
                offset_active = offsets_jlstz[active_orientation][offset]
            }

            var offset_x = offset_active[0] - offset_rotated[0]
            var offset_y = offset_active[1] - offset_rotated[1]

            return [offset_x, -1 * offset_y]
        }

        this.clear_piece();


        // gotta hard copy
        var rotated_piece = Object.assign(Object.create(Object.getPrototypeOf(this.active_piece)), this.active_piece)
        if (clockwise) {
            rotated_piece.rotate()
        } else {
            rotated_piece.rotate_counter()
        }

        var is_valid_rotation = false;
        // guideline SRS: https://tetris.wiki/Super_Rotation_System

        for (var i = 0; i < 5; i++) {
            var offsets = get_rotated_offsets(rotated_piece.orientation, this.active_piece.orientation, i, this.active_piece.name)
            if (this.valid_move(this.active_x + offsets[0], this.active_y + offsets[1], rotated_piece)) {
                this.active_x = this.active_x + offsets[0]
                this.active_y = this.active_y + offsets[1]
                is_valid_rotation = true;
                break;
            }
        }

        if (is_valid_rotation) {
            if (clockwise) {

                this.active_piece.rotate();
            } else {
                this.active_piece.rotate_counter()
            }
        }
        this.load_piece()
    }

    draw() {
        var scale = 30;
        var canvas = document.getElementById('tetris_canvas');
        var ctxNext = canvas.getContext('2d');
        canvas.width = this.board_width * scale;
        canvas.height = (this.board_height-1) * scale;


        ctxNext.scale(scale, scale);


        for (var y = 1; y < this.board_height; y++) {
            for (var x = 0; x < this.board_width; x++) {
                if (this.board[y][x] == 0) {
                    ctxNext.fillStyle = 'black';
                    ctxNext.fillRect(x, y-1, 1, 1);

                } else {
                    ctxNext.fillStyle = 'rgb(' + this.board[y][x][0] * 255 + ',' + this.board[y][x][1] * 255 + ',' + this.board[y][x][2] * 255 + ')';
                    ctxNext.fillRect(x, y-1, 1, 1);

                }


            }
        }

        ctxNext.scale(1/30, 1/30);
        ctxNext.strokeStyle = 'rgb(61,61,61)';
        ctxNext.lineWidth = 1;

        ctxNext.beginPath();
        for (var x = 0; x <= this.board_width * scale; x += scale) {
            ctxNext.moveTo(x, 0);
            ctxNext.lineTo(x, this.board_height * scale);
        }
        ctxNext.stroke();

        ctxNext.beginPath();
        for (var y = 0; y <= this.board_height * scale; y += scale) {
            ctxNext.moveTo(0, y);
            ctxNext.lineTo(this.board_height * scale, y);
        }
        ctxNext.stroke();

    }


}

class Tetromino {
    constructor(name) {
        var tetromino;
        if (name == null) {
            tetromino = this.get_random()
        } else {
            tetromino = get_tetronmino(name)
        }
        this.shape = tetromino.shape
        this.color = tetromino.color
        this.name = tetromino.name
        this.orientation = tetromino.orientation

    }
    reset(){
        var tetromino = get_tetronmino(this.name)

        this.shape = tetromino.shape
        this.color = tetromino.color
        this.name = tetromino.name
        this.orientation = tetromino.orientation

    }


    get_random() {
        return tetrominos[Math.floor(Math.random() * tetrominos.length)];
    }


    rotate() {
        if (this.name == 'O')
            return
        var rotated_piece = JSON.parse(JSON.stringify(this.shape));
        for (var y = 0; y < rotated_piece.length; ++y) {
            for (var x = 0; x < y; ++x) {
                [rotated_piece[x][y], rotated_piece[y][x]] = [rotated_piece[y][x], rotated_piece[x][y]];
            }
        }

        rotated_piece.forEach(row => row.reverse());
        this.shape = rotated_piece
        var orientation_index = orientations.indexOf(this.orientation)
        orientation_index = (orientation_index + 1) % 4
        this.orientation = orientations[orientation_index]
    }

    rotate_counter() {
        if (this.name == 'O')
            return
        var rotated_piece = JSON.parse(JSON.stringify(this.shape));
        rotated_piece.forEach(row => row.reverse());

        for (var y = 0; y < rotated_piece.length; ++y) {
            for (var x = 0; x < y; ++x) {
                [rotated_piece[x][y], rotated_piece[y][x]] = [rotated_piece[y][x], rotated_piece[x][y]];
            }
        }

        this.shape = rotated_piece
        var orientation_index = orientations.indexOf(this.orientation)
        orientation_index = (((orientation_index - 1) % 4) + 4) % 4
        this.orientation = orientations[orientation_index]
    }

}

