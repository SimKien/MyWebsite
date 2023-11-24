import { PieceColor, Color, Move, PositionAbsolute } from "chess/lib/constants/ChessConstants";
import { WebsocketCLient as WebsocketClient } from "chess/lib/communication/Websocket";
import { WebsocketTypes } from "chess/lib/constants/WebsocketConstants";
import { Signal } from "@preact/signals-react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BASE_URLS, ENDPOINTS, getBoardPosition, getGame, getNewPlayer, getValidMoves } from "chess/lib/communication/api";
import { convertToMoveInformation, convertToMoves } from "chess/lib/communication/WSDataParser";
import { WebsocketMessage, PlayerInformation, SpecialMove } from "chess/lib/constants/CommunicationConstants";

const PLAYER_STORE_KEY = "player";

export interface Player {
    color: PieceColor;
    id: string;
    token: string;
}

export interface PlayerMetaStore {
    id: string;
    token: string;
    valid: boolean;
    setId: (id: string) => void;
    setToken: (token: string) => void;
    setValid: (valid: boolean) => void;
}

export const usePlayerStore = create<PlayerMetaStore>()(
    persist(
        (set) => ({
            id: "",
            token: "",
            valid: false,
            setId: (id: string) => set({ id }),
            setToken: (token: string) => set({ token }),
            setValid: (valid: boolean) => set({ valid })
        }),
        { name: PLAYER_STORE_KEY }
    )
);

export class Session {
    player: Signal<Player>;
    connection: WebsocketClient | undefined;
    validMoves: Signal<Map<PositionAbsolute, PositionAbsolute[]>>;
    boardPosition: Signal<string>;
    specialMoves: Signal<SpecialMove[]>;
    makeMove: (move: Move, specialMove: SpecialMove | undefined) => void

    constructor(boardPosition: Signal<string>, validMoves: Signal<Map<PositionAbsolute, PositionAbsolute[]>>,
        player: Signal<Player>, specialMoves: Signal<SpecialMove[]>) {
        this.connection = undefined
        this.player = player;
        this.validMoves = validMoves
        this.boardPosition = boardPosition
        this.specialMoves = specialMoves
        this.makeMove = () => { }
    }

    async generateSession() {
        await Promise.all([this.createGame(), this.connectToWebsocket()])

        await Promise.all([this.fetchBoardPosition(), this.fetchValidMoves()])
    }

    async connectToWebsocket() {
        let playerInformation: PlayerInformation = {
            id: this.player.value.id,
            token: this.player.value.token
        }
        this.connection = new WebsocketClient(BASE_URLS.WEBSOCKET + ENDPOINTS.GET_WS + `?player_id=${playerInformation.id}&token=${playerInformation.token}`)
        this.connection.addHandler(console.log)                                             //TODO: Evtl am Ende entfernen
    }

    async createGame() {
        let playerInformation: PlayerInformation = {
            id: this.player.value.id,
            token: this.player.value.token
        }
        await getGame(playerInformation).then((res) => {
            let newPlayer = {
                id: this.player.value.id,
                token: this.player.value.token,
                color: res.color as PieceColor
            }
            this.player.value = newPlayer
        })
    }

    async createPlayer() {
        let playerInfo = await getNewPlayer();
        this.player.value = { color: Color.WHITE, id: playerInfo.id, token: playerInfo.token }
    }

    async fetchBoardPosition() {
        let playerInformation: PlayerInformation = {
            id: this.player.value.id,
            token: this.player.value.token
        }
        await getBoardPosition(playerInformation).then((res) => this.boardPosition.value = res.board_position)
    }

    async fetchValidMoves() {
        let playerInformation: PlayerInformation = {
            id: this.player.value.id,
            token: this.player.value.token
        }
        await getValidMoves(playerInformation).then((data) => {
            this.validMoves.value = new Map<String, String[]>(Object.entries(data.valid_moves)) as Map<PositionAbsolute, PositionAbsolute[]>
            this.specialMoves.value = Array.from(data.special_moves)
        })
    }

    reportMove(move: Move, specialMove: SpecialMove | undefined) {
        if (this.connection?.connection.readyState !== WebSocket.OPEN) {
            let handlers = this.connection?.handlers
            let playerInformation: PlayerInformation = {
                id: this.player.value.id,
                token: this.player.value.token
            }
            this.connection = new WebsocketClient(BASE_URLS.WEBSOCKET + ENDPOINTS.GET_WS + `?player_id=${playerInformation.id}&token=${playerInformation.token}`)
            handlers?.forEach((handler) => this.connection?.addHandler(handler))
        }

        this.validMoves.value = new Map<PositionAbsolute, PositionAbsolute[]>()         //theres no valid move when player just moved
        let moveInfo = convertToMoveInformation(move, specialMove)
        this.connection?.send(JSON.stringify(moveInfo))
    }

    receiveMove(moveInformationString: string) {
        void this.fetchValidMoves()

        let moveInformation: WebsocketMessage
        try {
            moveInformation = JSON.parse(moveInformationString)
        } catch (e) {
            console.log(e)
            return
        }
        if (moveInformation.message_type !== WebsocketTypes.MOVE) return

        const [move, specialMove] = convertToMoves(moveInformation)

        this.makeMove(move, specialMove)
    }
}