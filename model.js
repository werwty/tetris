class Board {
    constructor() {
        this.board_height = 20
        this.board_width = 10
        this.reset()

        this.new_piece()
        this.game_over = false
    }

    new_piece() {
        this.active_piece = new Tetromino()
        this.active_x = 3
        this.active_y = 0
        if (this.valid_move(this.active_x, this.active_y)) {
            this.load_piece()
        } else {
            //this.load_piece()

            this.game_over = true
        }
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

    valid_move(temp_x, temp_y, piece=this.active_piece) {
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

    valid_load(temp_x, temp_y) {
        for (var y = 0; y < this.active_piece.shape.length; y++) {
            for (var x = 0; x < this.active_piece.shape[y].length; x++) {

                var value = this.active_piece.shape[y][x]
                if (value != 0) {

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
        this.clear_piece();



        this.active_piece.rotate()

        //TODO calculate new active x and active y
        this.load_piece()

    }
}

class Tetromino {
    constructor() {
        var tetromino = this.get_random()
        this.shape = tetromino.shape
        this.color = tetromino.color
    }


    get_random() {
        var tetrominos = {
            'I': {
                'shape': [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
                'color': [0, 1, 1]

            },
            'T': {
                'shape': [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
                'color': [148 / 255, 0 / 255, 211 / 255]

            },
            'L': {
                'shape': [[0, 0, 1], [1, 1,1], [0, 0, 0]],
                'color': [1, 90 / 255, 0 / 255]

            },
            'J': {
                'shape': [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
                'color': [20 / 255, 20 / 255, 175 / 255]
            },
            'Z': {
                'shape': [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
                'color': [1, 0, 0]
            },
            'S': {
                'shape': [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
                'color': [0 / 255, 1, 0 / 255]
            },
            'O': {
                'shape': [[1, 1], [1, 1]],
                'color': [1, 1, 0]
            }


        }
        var names = Object.keys(tetrominos);
        return tetrominos[names[names.length * Math.random() << 0]];

    }


    rotate() {
        // Clone with JSON for immutability.
        let p = JSON.parse(JSON.stringify(this.shape));

        // Transpose matrix
        for (let y = 0; y < p.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [p[x][y], p[y][x]] = [p[y][x], p[x][y]];
            }
        }

        // Reverse the order of the columns.
        p.forEach(row => row.reverse());
        this.shape = p


    }


}
