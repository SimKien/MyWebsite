const HOSTNAME_DEV = "localhost:8080";
const HOSTNAME_PROD = "chess.simonkienle.de:8080";

export const BASE_URLS = import.meta.env.DEV
    ? {
        WEBSOCKET: `ws://${HOSTNAME_DEV}`,
        FETCH: `http://${HOSTNAME_DEV}/api`,
    }
    : {
        WEBSOCKET: `wss://${HOSTNAME_PROD}`,
        FETCH: `https://${HOSTNAME_PROD}/api`,
    };

export const ENDPOINTS = {
    POST_GAME: "/game",                     //Creates a new game or signals intend to join a game, gives id and token
    GET_BOARD_POSITION: "/board-position",  //Returns the current board position
    GET_VALID_MOVES: "/valid-moves",        //Returns a map of valid moves
    GET_PLAYER: "/player",                  //Returns a new player
    GET_WS: "/ws"                           //Returns a new websocket connection
}