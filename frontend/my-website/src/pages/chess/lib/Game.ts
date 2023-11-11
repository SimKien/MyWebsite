import { PieceColor, Color, Move, PositionAbsolute } from "pages/chess/lib/constants/ChessConstants";
import { WebsocketCLient } from "pages/chess/lib/websocket/Websocket";
import { MoveHints, MoveInformation, MoveType, PlayerInformation, WebsocketTypes } from "pages/chess/lib/constants/WebsocketConstants";
import { Signal } from "@preact/signals-react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BASE_URLS, ENDPOINTS, getBoardPosition, getGame, getNewPlayer, getValidMoves } from "pages/chess/lib/websocket/api";

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
    setToken: (passPhrase: string) => void;
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
        { name: "player" }
    )
);

export class Session {
    player: Signal<Player>;
    connection: WebsocketCLient;
    validMoves: Signal<Map<PositionAbsolute, PositionAbsolute[]>>;
    boardPosition: Signal<string>;

    constructor(boardPosition: Signal<string>, validMoves: Signal<Map<PositionAbsolute, PositionAbsolute[]>>,
        player: Signal<Player>) {
        this.connection = new WebsocketCLient(BASE_URLS.WEBSOCKET + ENDPOINTS.GET_WS)
        this.connection.addHandler(console.log)                                             //TODO: Am Ende entfernen
        this.player = player;
        this.validMoves = validMoves
        this.boardPosition = boardPosition
    }

    async generateSession() {
        let playerInformation: PlayerInformation = {
            id: this.player.value.id,
            token: this.player.value.token
        }
        await getGame(playerInformation).then((res) => this.player.value.color = res.color as PieceColor)

        await Promise.all([this.fetchBoardPosition(), this.fetchValidMoves()])
    }

    async createPlayer() {
        let playerInfo = await getNewPlayer();
        this.player.value = { color: Color.White, id: playerInfo.id, token: playerInfo.token }
    }

    async fetchBoardPosition() {
        let playerInformation: PlayerInformation = {
            id: this.player.value.id,
            token: this.player.value.token
        }
        await getBoardPosition(playerInformation).then((res) => this.boardPosition.value = res.boardPosition)
    }

    async fetchValidMoves() {
        let playerInformation: PlayerInformation = {
            id: this.player.value.id,
            token: this.player.value.token
        }
        await getValidMoves(playerInformation).then((data) => this.validMoves.value = data.validMoves)
    }

    reportMove = (move: Move) => {
        this.validMoves.value = new Map<PositionAbsolute, PositionAbsolute[]>()         //theres no valid move when player just moved
        let moveInfo: MoveInformation = {
            type: WebsocketTypes.MOVE,
            from: move.fromAbsolute,
            to: move.toAbsolute,
            moveType: MoveType.NORMAL,                  //TODO: possibly other move types
            moveHint: MoveHints.NONE                    //TODO: possibly other move hints
        }
        this.connection.send(JSON.stringify(moveInfo))
    }

    receiveMove = () => {
        this.fetchValidMoves()

        //TODO: Receive Move and valid moves from Server
    }
}