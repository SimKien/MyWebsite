import axios from "axios";
import { BoardPositionInformation, PlayerGameInformation, UserInformation, UserValid, ValidMovesInformation } from "chess/lib/constants/CommunicationConstants";

const HOSTNAME_DEV = "localhost:5173";
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
    GET_VALID_MOVES: "/valid-moves",        //Returns a map of valid moves, gives id and token of the user via query params
    GET_BOARD_POSITION: "/board-position",  //Returns the current board position, gives id and token of the user via query params
    GET_DEFAULT_BOARD: "/default-board",    //Returns the default board position
    GET_PLAYER: "/user",                    //Returns a new user
    GET_IS_VALID: "/is-valid",              //Returns whether a user is valid, gives id and token of the user via query params
    GET_WS: "/ws"                           //Returns a new websocket connection
}

export const getWebsocketUrl = (userInformation: UserInformation): string => BASE_URLS.WEBSOCKET + ENDPOINTS.GET_WS + `?user_id=${userInformation.id}&token=${userInformation.token}`

export const AXIOS = axios.create({ baseURL: BASE_URLS.FETCH })

export const getNewUser = (): Promise<UserInformation> => AXIOS.get(ENDPOINTS.GET_PLAYER).then((res) => res.data)

export const getGame = (userInformation: UserInformation): Promise<PlayerGameInformation> => AXIOS.get(ENDPOINTS.GET_GAME + `?user_id=${userInformation.id}&token=${userInformation.token}`).then((res) => res.data)

export const getBoardPosition = (userInformation: UserInformation): Promise<BoardPositionInformation> => AXIOS.get(ENDPOINTS.GET_BOARD_POSITION + `?user_id=${userInformation.id}&token=${userInformation.token}`).then((res) => res.data)

export const getDefaultBoard = (): Promise<BoardPositionInformation> => AXIOS.get(ENDPOINTS.GET_DEFAULT_BOARD).then((res) => res.data)

export const getValidMoves = (userInformation: UserInformation): Promise<ValidMovesInformation> => AXIOS.get(ENDPOINTS.GET_VALID_MOVES + `?user_id=${userInformation.id}&token=${userInformation.token}`).then((res) => res.data)

export const getIsValid = (userInformation: UserInformation): Promise<UserValid> => AXIOS.get(ENDPOINTS.GET_IS_VALID + `?user_id=${userInformation.id}&token=${userInformation.token}`).then((res) => res.data)