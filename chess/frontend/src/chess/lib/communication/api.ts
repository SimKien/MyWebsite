import axios from "axios";
import { BoardPositionInformation, PlayerGameInformation, PlayerInformation, PlayerValid, ValidMovesInformation } from "chess/lib/constants/CommunicationConstants";

const HOSTNAME_DEV = "localhost:8080";
const HOSTNAME_PROD = window.location.host;

export const BASE_URLS = import.meta.env.DEV
    ? {
        WEBSOCKET: `ws://${HOSTNAME_DEV}`,
        FETCH: `http://${HOSTNAME_DEV}/api`,
    }
    : {
        WEBSOCKET: `ws://${HOSTNAME_PROD}`,                     //TODO: Ändern
        FETCH: `http://${HOSTNAME_PROD}/api`,                   //TODO: Ändern
    };

export const ENDPOINTS = {
    GET_GAME: "/game",                      //Creates a new game or signals intend to join a game, gives id and token
    GET_VALID_MOVES: "/valid-moves",        //Returns a map of valid moves, gives id and token of the player via query params
    GET_BOARD_POSITION: "/board-position",  //Returns the current board position, gives id and token of the player via query params
    GET_PLAYER: "/player",                  //Returns a new player
    GET_IS_VALID: "/is-valid",              //Returns whether a player is valid, gives id and token of the player via query params
    GET_WS: "/ws"                           //Returns a new websocket connection
}

export const AXIOS = axios.create({ baseURL: BASE_URLS.FETCH })

export const getNewPlayer = (): Promise<PlayerInformation> => AXIOS.get(ENDPOINTS.GET_PLAYER).then((res) => res.data)

export const getGame = (playerInformation: PlayerInformation): Promise<PlayerGameInformation> => AXIOS.get(ENDPOINTS.GET_GAME + `?player_id=${playerInformation.id}&token=${playerInformation.token}`).then((res) => res.data)

export const getBoardPosition = (playerInformation: PlayerInformation): Promise<BoardPositionInformation> => AXIOS.get(ENDPOINTS.GET_BOARD_POSITION + `?player_id=${playerInformation.id}&token=${playerInformation.token}`).then((res) => res.data)

export const getValidMoves = (playerInformation: PlayerInformation): Promise<ValidMovesInformation> => AXIOS.get(ENDPOINTS.GET_VALID_MOVES + `?player_id=${playerInformation.id}&token=${playerInformation.token}`).then((res) => res.data)

export const getIsValid = (playerInformation: PlayerInformation): Promise<PlayerValid> => AXIOS.get(ENDPOINTS.GET_IS_VALID + `?player_id=${playerInformation.id}&token=${playerInformation.token}`).then((res) => res.data)