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

class Board {
    constructor() {
        this.board_height = 20
        this.board_width = 10
        this.reset()

        this.new_piece()
        this.game_over = false
        this.score = 0

    }

    new_piece() {
        var lines_cleared = this.clear_lines()
        this.score = this.score+lines_cleared;
        this.active_piece = new Tetromino()
        this.active_x = 3
        this.active_y = 0
        if (this.active_piece.name == 'I'){
            this.active_y = -2
        }


        if (this.valid_move(this.active_x, this.active_y)) {
            this.load_piece()
        } else {
            this.game_over = true
        }
    }

    clear_lines() {
        var number_lines_cleared = 0;
        for (var y = 0; y < this.board_height; y++) {
            var line_clear = true
            for (var x = 0; x < this.board_width; x++) {
                if(this.board[y][x] ==0){
                    line_clear=false
                }
            }
            if(line_clear){
                number_lines_cleared++

                for(var j=y;j>1; j--){
                    this.board[j] = JSON.parse(JSON.stringify(this.board[j-1]))
                }
                this.board[0] =  Array(this.board_width).fill(0)
                debugger
            }
        }
        return number_lines_cleared
    }

    // Reset board to empty array
    reset() {
        this.board = Array.from(
            {length: this.board_height}, () => Array(this.board_width).fill(0)
        );
    }

    load_piece() {
        this.active_piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {

                if (value != 0) {
                    this.board[this.active_y + y][this.active_x + x] = this.active_piece.color
                }
            });
        });
    }

    clear_piece() {
        this.active_piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {

                if (value != 0) {
                    this.board[this.active_y + y][this.active_x + x] = 0
                }
            });
        });
    }

    test_fill() {
        this.board.forEach((row, y) => {
            row.forEach((value, x) => {
                if (x % 2 == 0 && y % 2 == 0) {
                    this.board[y][x] = [1, .1, .1]
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
        this.clear_piece();

        if (this.valid_move(this.active_x, this.active_y + 1)) {
            this.active_y++
            this.load_piece()
        } else {
            this.load_piece()

            this.new_piece()
        }
    }

    valid_move(temp_x, temp_y, piece = this.active_piece) {
        for (var y = 0; y < piece.shape.length; y++) {
            for (var x = 0; x < piece.shape[y].length; x++) {

                var value = piece.shape[y][x]
                if (value != 0) {
                    // Check for board collision
                    if (temp_x + x > this.board_width || temp_x + x < 0 || temp_y + y >= this.board_height) {
                        return false
                    }
                    // check for piece collision
                    if (this.board[temp_y + y][temp_x + x] != 0) {
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

    rotate() {
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

            return [offset_x, offset_y]
        }

        this.clear_piece();


        // gotta hard copy
        var rotated_piece = Object.assign(Object.create(Object.getPrototypeOf(this.active_piece)), this.active_piece)
        rotated_piece.rotate()

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
            this.active_piece.rotate();
        }
        this.load_piece()
    }
}

class Tetromino {
    constructor(name) {
        var tetromino;
        if (name == null) {
            tetromino = this.get_random()
        } else {
            tetromino = this.get_tetronmino(name)
        }
        this.shape = tetromino.shape
        this.color = tetromino.color
        this.name = tetromino.name
        this.orientation = tetromino.orientation

    }


    tetrominos = [
        {
            'name': 'I',
            'shape': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 1, 1, 1, 1], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]],
            'color': [0, 1, 1],
            'orientation': orientations[0]

        },
        {
            'name': 'T',
            'shape': [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
            'color': [148 / 255, 0 / 255, 211 / 255],
            'orientation': orientations[0]

        },
        {
            'name': 'L',
            'shape': [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
            'color': [1, 90 / 255, 0 / 255],
            'orientation': orientations[0]

        },
        {
            'name': 'J',
            'shape': [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
            'color': [20 / 255, 20 / 255, 175 / 255],
            'orientation': orientations[0]
        },
        {
            'name': 'Z',
            'shape': [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
            'color': [1, 0, 0],
            'orientation': orientations[0]
        },
        {
            'name': 'S',
            'shape': [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
            'color': [0 / 255, 1, 0 / 255],
            'orientation': orientations[0]
        },
        {
            'name': 'O',
            'shape': [[0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]],
            'color': [1, 1, 0],
            'orientation': orientations[0]
        }]

    get_random() {
        return this.tetrominos[Math.floor(Math.random() * this.tetrominos.length)];
    }

    get_tetronmino(name) {
        for (var i = 0; i < this.tetrominos.length; i++) {
            var tetromino = this.tetrominos[i];
            if (tetromino.name == name) {
                return tetromino
            }
        }
    }

    rotate() {

        if (this.name == 'O')
            return
        let rotate_shape = JSON.parse(JSON.stringify(this.shape));
        for (let y = 0; y < rotate_shape.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [rotate_shape[x][y], rotate_shape[y][x]] = [rotate_shape[y][x], rotate_shape[x][y]];
            }
        }

        rotate_shape.forEach(row => row.reverse());
        this.shape = rotate_shape

        // TODO do an index lookup and use that
        var orientation_index = orientations.indexOf(this.orientation)
        orientation_index = (orientation_index + 1) % 4
        this.orientation = orientations[orientation_index]
    }


}

