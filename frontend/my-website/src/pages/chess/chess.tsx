import Board from "pages/chess/components/Board";
import "pages/chess/style/Chess.css"
import "pages/chess/lib/websocket/Websocket"
import { Signal, signal } from "@preact/signals-react";
import { Player, Session } from "pages/chess/lib/Game";
import { useRef } from "react";
import { BoardOperations, Color, PieceColor, PositionAbsolute } from "pages/chess/lib/constants/ChessConstants";

const boardPosition: Signal<string> = signal<string>("");
const validMoves = signal<Map<PositionAbsolute, PositionAbsolute[]>>(new Map<PositionAbsolute, PositionAbsolute[]>());
const player = signal<Player>(new Player(Color.White as PieceColor, "", ""));
const session = signal<Session>(new Session(boardPosition, validMoves, player));

export default function Chess() {

    const boardOperationsRef = useRef<BoardOperations>({ flipBoard: () => { }, makeMove: () => { } });

    return (
        <div className="mainbody">
            <Board boardPosition={boardPosition} reportMove={session.value.reportMove}
                player={player} boardOperations={boardOperationsRef.current} validMoves={validMoves} />
            <button onClick={boardOperationsRef.current.flipBoard}>Flip Board</button>
        </div>
    );
}