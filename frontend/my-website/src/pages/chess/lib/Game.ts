import { PieceColor, Color, Move, PositionAbsolute } from "pages/chess/lib/constants/ChessConstants";
import { WebsocketCLient } from "pages/chess/lib/websocket/Websocket";
import { MoveHints, MoveInformation, MoveType, WebsocketTypes } from "pages/chess/lib/constants/WebsocketConstants";
import { Signal } from "@preact/signals-react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BASE_URLS, ENDPOINTS } from "pages/chess/lib/websocket/api";

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
        this.connection.addHandler(console.log)
        this.player = player;
        this.validMoves = validMoves
        this.boardPosition = boardPosition
    }

    generateSession() {
        //mit /game und http einem neuen Game beitreten und color des Spielers setzen

        this.fetchBoardPosition()
        this.fetchValidMoves()
    }

    createPlayer() {
        //mit /player und http einen neuen Player erstellen, nur id und token
        this.player.value = { color: Color.White, id: "1234", token: "1234" }
    }

    fetchBoardPosition() {
        //mit /board-position und http die aktuelle Board Position abfragen
        this.boardPosition.value = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
    }

    fetchValidMoves() {
        //mit /valid-moves und http die valid moves abfragen
        this.validMoves.value = new Map<PositionAbsolute, PositionAbsolute[]>()
    }

    reportMove = (move: Move) => {
        this.validMoves.value = new Map<PositionAbsolute, PositionAbsolute[]>()         //theres no valid move when player just moved
        let moveInfo: MoveInformation = {
            type: WebsocketTypes.MOVE,
            from: move.fromAbsolute,
            to: move.toAbsolute,
            moveType: MoveType.NORMAL,                  //TODO: possibly other move types
            moveHint: MoveHints.NONE
        }
        //this.connection.send(JSON.stringify(moveInfo))
    }

    receiveMove = () => {
        this.fetchValidMoves()

        //TODO: Receive Move and valid moves from Server
    }
}