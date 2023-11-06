import { PieceColor, Color, Move } from "pages/chess/lib/constants/ChessConstants";
import { WebsocketCLient } from "pages/chess/lib/websocket/Websocket";
import { MoveInformation, chessServerEndpoint } from "pages/chess/lib/constants/WebsocketConstants";
import { getMoveInformation } from "pages/chess/lib/websocket/WSDataParser";

export class Player {
    color: PieceColor;
    id: string;
    passPhrase: string;

    constructor(color: PieceColor, id: string, passPhrase: string) {
        this.color = color;
        this.id = id;
        this.passPhrase = passPhrase;
    }

    setColor(color: PieceColor) {
        this.color = color;
    }

    setId(id: string) {
        this.id = id;
    }

    setPassPhrase(passPhrase: string) {
        this.passPhrase = passPhrase;
    }
}

export class Session {
    player: Player;
    connection: WebsocketCLient;
    validMoves: MoveInformation[];
    boardPosition: string;

    //TODO: add current valid Moves

    constructor() {
        this.player = new Player(Color.White as PieceColor, "", "");
        this.connection = new WebsocketCLient(chessServerEndpoint)
        this.connection.addHandler(console.log)
        this.validMoves = []
        this.boardPosition = ""
    }

    generateSession() {
        //TODO: ask Server for Player and set Player
        this.player = new Player(Color.White as PieceColor, "", "")

        this.pullBoardPosition()
    }

    pullBoardPosition() {
        //TODO: ask Server for Board Position
        this.boardPosition = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
    }

    pullValidMoves() {
        //TODO: get Valid Moves from Server
    }

    reportMove = (move: Move) => {
        let moveInfo: MoveInformation = getMoveInformation(move)
        //this.connection.send(JSON.stringify(moveInfo))
    }

    receiveMove = () => {
        this.pullValidMoves()  //after receiving move, get new valid moves

        //TODO: Receive Move from Server
    }
}