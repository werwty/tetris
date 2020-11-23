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
            'color': [49/255, 179/255, 211/255],
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
            'color': [237/255, 151 / 255, 31 / 255],
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
            'color': [206/255,  26/255, 26/255],
            'orientation': orientations[0]
        },
        {
            'name': 'S',
            'shape': [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
            'color': [17/ 255, 184/255, 0 / 255],
            'orientation': orientations[0]
        },
        {
            'name': 'O',
            'shape': [[0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]],
            'color': [1, 209/255, 0],
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

function get_permutated_bag(){
    var bag =JSON.parse(JSON.stringify(default_bag))
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
        this.board_height = 20
        this.board_width = 10
        this.reset()
        this.bag = get_permutated_bag()
        this.next_bag = get_permutated_bag()
        this.new_piece()
        this.game_over = false
        this.score = 0
        this.hold_piece = null

    }
    get_active_piece_coordinates(){
        var coordinates = []
        this.active_piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value != 0) {
                    coordinates.push([this.active_x + x, this.active_y + y])
                }
            });
        });
        return coordinates
    }
    new_piece() {

        this.active_piece = new Tetromino(this.bag.pop())
        this.bag.unshift(this.next_bag.pop())



        if(this.next_bag.length ==0){
            this.next_bag= get_permutated_bag()
        }

        var lines_cleared = this.clear_lines()
        this.score = this.score+lines_cleared;
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

    hold(){
        this.clear_piece();

        if(this.hold_piece == null){
            this.hold_piece = this.active_piece;
            this.new_piece()
        }
        else{
            var temp = this.hold_piece;
            this.hold_piece= this.active_piece;
            this.active_piece= temp
            this.active_x=3
            this.active_y=0
        }

        this.load_piece()
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
        var do_redraw=false
        this.clear_piece();

        if (this.valid_move(this.active_x, this.active_y + 1)) {
            this.active_y++
            this.load_piece()
        } else {
            this.load_piece()

            this.new_piece()
            do_redraw=true
        }
        return do_redraw
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

    rotate(clockwise=true) {
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
        if (clockwise) {
            rotated_piece.rotate()
        }
        else{
            debugger
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
                    }else{
                        this.active_piece.rotate_counter()
                    }
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
            tetromino = get_tetronmino(name)
        }
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
        orientation_index = (((orientation_index -1) % 4) + 4) % 4
        this.orientation = orientations[orientation_index]
    }

}

