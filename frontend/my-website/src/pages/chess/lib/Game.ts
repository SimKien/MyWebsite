import { PieceColor, Color, Move, PositionAbsolute, SpecialMove } from "pages/chess/lib/constants/ChessConstants";
import { WebsocketCLient } from "pages/chess/lib/websocket/Websocket";
import { MoveInformation, MoveTypes, PlayerInformation, WebsocketTypes } from "pages/chess/lib/constants/WebsocketConstants";
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
    specialMoves: Signal<SpecialMove[]>;

    constructor(boardPosition: Signal<string>, validMoves: Signal<Map<PositionAbsolute, PositionAbsolute[]>>,
        player: Signal<Player>, specialMoves: Signal<SpecialMove[]>) {
        this.connection = new WebsocketCLient(BASE_URLS.WEBSOCKET + ENDPOINTS.GET_WS)
        this.connection.addHandler(console.log)                                             //TODO: Am Ende entfernen
        this.player = player;
        this.validMoves = validMoves
        this.boardPosition = boardPosition
        this.specialMoves = specialMoves
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
        this.player.value = { color: Color.WHITE, id: playerInfo.id, token: playerInfo.token }
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
        await getValidMoves(playerInformation).then((data) => {
            this.validMoves.value = data.validMoves
            this.specialMoves.value = data.specialMoves
        })
    }

    reportMove = (move: Move, specialMove: SpecialMove | undefined) => {
        this.validMoves.value = new Map<PositionAbsolute, PositionAbsolute[]>()         //theres no valid move when player just moved
        let moveInfo: MoveInformation = {
            messageType: WebsocketTypes.MOVE,
            from: move.fromAbsolute,
            to: move.toAbsolute,
            moveType: MoveTypes.NORMAL
        }
        if (specialMove) {
            moveInfo.moveType = specialMove.type
            if (specialMove.type === MoveTypes.PROMOTION) {
                moveInfo.promotionPiece = move.promotionPiece
            }
        }
        this.connection.send(JSON.stringify(moveInfo))
    }

    receiveMove = () => {
        this.fetchValidMoves()      //wichtig: zuerst specialMoves setzen, damit makeMove sie berücksichtigen kann beim Setzen des Boards

        //TODO: Receive Move and valid moves from Server
    }
}