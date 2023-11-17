import axios from "axios";
import { BoardPositionInformation, PlayerGameInformation, PlayerInformation, ValidMovesInformation } from "chess/lib/constants/WebsocketConstants";

const HOSTNAME_DEV = "localhost:8080";
const HOSTNAME_PROD = window.location.host;

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
    GET_GAME: "/game",                      //Creates a new game or signals intend to join a game, gives id and token
    GET_VALID_MOVES: "/valid-moves",        //Returns a map of valid moves, gives id and token of the player via query params
    GET_BOARD_POSITION: "/board-position",  //Returns the current board position, gives id and token of the player via query params
    GET_PLAYER: "/player",                  //Returns a new player
    GET_WS: "/ws"                           //Returns a new websocket connection
}

export const AXIOS = axios.create({ baseURL: BASE_URLS.FETCH })

export const getNewPlayer = (): Promise<PlayerInformation> => AXIOS.get(ENDPOINTS.GET_PLAYER).then((res) => res.data)

export const getGame = (playerInformation: PlayerInformation): Promise<PlayerGameInformation> => AXIOS.post(ENDPOINTS.GET_BOARD_POSITION + `?id=${playerInformation.id}&token=${playerInformation.token}`).then((res) => res.data)

export const getBoardPosition = (playerInformation: PlayerInformation): Promise<BoardPositionInformation> => AXIOS.get(ENDPOINTS.GET_BOARD_POSITION + `?id=${playerInformation.id}&token=${playerInformation.token}`).then((res) => res.data)

export const getValidMoves = (playerInformation: PlayerInformation): Promise<ValidMovesInformation> => AXIOS.get(ENDPOINTS.GET_VALID_MOVES + `?id=${playerInformation.id}&token=${playerInformation.token}`).then((res) => res.data)