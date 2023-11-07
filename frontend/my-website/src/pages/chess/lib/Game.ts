import { PieceColor, Color, Move, PositionAbsolute } from "pages/chess/lib/constants/ChessConstants";
import { WebsocketCLient } from "pages/chess/lib/websocket/Websocket";
import { MoveInformation, chessServerEndpoint } from "pages/chess/lib/constants/WebsocketConstants";
import { Signal } from "@preact/signals-react";

export class Player {
    color: PieceColor;
    id: string;
    passPhrase: string;

    constructor(color: PieceColor, id: string, passPhrase: string) {
        this.color = color;
        this.id = id;
        this.passPhrase = passPhrase;
    }
}

export class Session {
    player: Signal<Player>;
    connection: WebsocketCLient;
    validMoves: Signal<Map<PositionAbsolute, PositionAbsolute[]>>;
    boardPosition: Signal<string>;

    //TODO: add current valid Moves

    constructor(boardPosition: Signal<string>, validMoves: Signal<Map<PositionAbsolute, PositionAbsolute[]>>, player: Signal<Player>) {
        this.connection = new WebsocketCLient(chessServerEndpoint)
        this.connection.addHandler(console.log)
        this.player = player;
        this.validMoves = validMoves
        this.boardPosition = boardPosition
        this.generateSession()
    }

    generateSession() {
        //TODO: ask Server for Player and set Player
        this.player.value = new Player(Color.White as PieceColor, "", "")

        this.pullBoardPosition()
        if (this.player.value.color === Color.Black as PieceColor) {
            this.validMoves.value = new Map<PositionAbsolute, PositionAbsolute[]>()
            return
        }
        this.pullValidMoves()
    }

    pullBoardPosition() {
        //TODO: ask Server for Board Position
        this.boardPosition.value = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
    }

    pullValidMoves() {
        this.validMoves.value = new Map<PositionAbsolute, PositionAbsolute[]>()
        //TODO: get Valid Moves from Server
    }

    reportMove = (move: Move) => {
        let moveInfo: MoveInformation = { from: move.fromAbsolute, to: move.toAbsolute }
        //this.connection.send(JSON.stringify(moveInfo))
        this.validMoves.value = new Map<PositionAbsolute, PositionAbsolute[]>()
    }

    receiveMove = () => {
        this.pullValidMoves()

        //TODO: Receive Move from Server
    }
}