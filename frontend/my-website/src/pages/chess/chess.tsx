import Board from "pages/chess/components/Board";
import "pages/chess/style/Chess.css"
import "pages/chess/lib/Websocket"
import { WebsocketCLient } from "pages/chess/lib/Websocket";
import { chessServerEndpoint } from "pages/chess/lib/constants/WebsocketConstants";
import { signal } from "@preact/signals-react";

const fen = signal<string>("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")

export default function Chess() {
    const webSocket = new WebsocketCLient(chessServerEndpoint)
    webSocket.addHandler(console.log)

    return (
        <div className="mainbody">
            <Board fen={fen} />
        </div>
    );
}