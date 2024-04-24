import axios, { AxiosResponse } from "axios";
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

export const getNewUser = (abortController: AbortController): Promise<AxiosResponse<UserInformation>> => {
    let config = {
        signal: abortController.signal
    }
    return AXIOS.get(ENDPOINTS.GET_PLAYER, config)
}

export const getGame = (userInformation: UserInformation, abortController: AbortController): Promise<AxiosResponse<PlayerGameInformation>> => {
    let config = {
        params: {
            user_id: userInformation.id,
            token: userInformation.token
        },
        signal: abortController.signal
    }
    return AXIOS.get(ENDPOINTS.GET_GAME, config)
}

export const getBoardPosition = (userInformation: UserInformation, abortController: AbortController): Promise<AxiosResponse<BoardPositionInformation>> => {
    let config = {
        params: {
            user_id: userInformation.id,
            token: userInformation.token
        },
        signal: abortController.signal
    }
    return AXIOS.get(ENDPOINTS.GET_BOARD_POSITION, config)
}

export const getDefaultBoard = (abortController: AbortController): Promise<AxiosResponse<BoardPositionInformation>> => {
    let config = {
        signal: abortController.signal
    }
    return AXIOS.get(ENDPOINTS.GET_DEFAULT_BOARD, config)
}

export const getValidMoves = (userInformation: UserInformation, abortController: AbortController): Promise<AxiosResponse<ValidMovesInformation>> => {
    let config = {
        params: {
            user_id: userInformation.id,
            token: userInformation.token
        },
        signal: abortController.signal
    }
    return AXIOS.get(ENDPOINTS.GET_VALID_MOVES, config)
}

export const getIsValid = (userInformation: UserInformation, abortController: AbortController): Promise<AxiosResponse<UserValid>> => {
    let config = {
        params: {
            user_id: userInformation.id,
            token: userInformation.token
        },
        signal: abortController.signal
    }
    return AXIOS.get(ENDPOINTS.GET_IS_VALID, config)
}