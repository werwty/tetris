class Board{
    constructor() {
        this.board_height= 20
        this.board_width = 10
        this.reset()

        this.active_piece = Tetromino.get_random()
        this.active_x = 3
        this.active_y = 0

        this.load_piece()
    }

    // Reset board to empty array
    reset() {
        this.board = Array.from(
          {length: this.board_height}, () => Array(this.board_width).fill(0)
        );
   }

   load_piece(){
        this.active_piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {

              if (value > 0) {
                this.board[this.active_y+y][this.active_x+ x]=this.active_piece.color
              }
            });
          });



   }
}

var Tetromino = {
    tetrominos: {
        'I': {
            'shape':  [[ 0, 1, 0 ], [ 0, 1, 0 ], [ 0, 1, 0 ], [ 0, 1, 0 ]],
            'color': [20,  20, 175]

        },


    },
    get_random: function(){
        var tetrominos = Object.keys(this.tetrominos);
        return this.tetrominos[tetrominos[ tetrominos.length * Math.random() << 0]];

    }


}
