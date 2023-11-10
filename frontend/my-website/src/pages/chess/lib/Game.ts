import { PieceColor, Color, Move, PositionAbsolute } from "pages/chess/lib/constants/ChessConstants";
import { WebsocketCLient } from "pages/chess/lib/websocket/Websocket";
import { MoveInformation, chessServerEndpoint } from "pages/chess/lib/constants/WebsocketConstants";
import { Signal } from "@preact/signals-react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

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
        this.connection = new WebsocketCLient(chessServerEndpoint)
        this.connection.addHandler(console.log)
        this.player = player;
        this.validMoves = validMoves
        this.boardPosition = boardPosition
        this.generateSession()
    }

    // Adde einen Handler für die verschiedenen Arten von Nachrichten: Move, newPlayer, newBoardPosition, newValidMoves

    generateSession() {
        // TODO: ask Server for Player and set Player

        // TODO: Nutze usePlayerStore: wenn er invalid ist, dann frage server nach komplett neuen Player und mache den valid
        //    wenn er valid ist, dann nutze das valid id und token und frage Server nach der color

        this.player.value = { color: Color.White, id: "", token: "" }

        this.fetchBoardPosition()
        if (this.player.value.color === Color.Black) {
            this.validMoves.value = new Map<PositionAbsolute, PositionAbsolute[]>()
            return
        }
        this.fetchValidMoves()
    }

    fetchBoardPosition() {
        //TODO: ask Server for Board Position
        this.boardPosition.value = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
    }

    fetchValidMoves() {
        this.validMoves.value = new Map<PositionAbsolute, PositionAbsolute[]>()
        //TODO: get Valid Moves from Server
    }

    reportMove = (move: Move) => {
        let moveInfo: MoveInformation = { kind: 'move', from: move.fromAbsolute, to: move.toAbsolute }
        //this.connection.send(JSON.stringify(moveInfo))
        this.validMoves.value = new Map<PositionAbsolute, PositionAbsolute[]>()
    }

    receiveMove = () => {
        this.fetchValidMoves()

        //TODO: Receive Move from Server
    }
}