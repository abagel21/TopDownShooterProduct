module.exports = class Game {
    constructor(id) {
        this.player_list = {};

    }
    Player(id) {
        let self = {
            x: 250,
            y: 250,
            id: id,
        }
        return self;
    }

}

// if (playerCounter == 2;) {
//     new game(socket_list)
// }
// playerCounter = 0;
// const game = require('./game')