import Board from "pages/chess/components/Board";
import "pages/chess/style/Chess.css"
import "pages/chess/lib/websocket/Websocket"
import { signal } from "@preact/signals-react";
import { Player, Session } from "pages/chess/lib/Game";
import { useRef } from "react";
import { BoardOperations, Color, PositionAbsolute } from "pages/chess/lib/constants/ChessConstants";


const boardPosition = signal<string>("");
const validMoves = signal<Map<PositionAbsolute, PositionAbsolute[]>>(new Map<PositionAbsolute, PositionAbsolute[]>());
const player = signal<Player>({ color: Color.White, id: "", token: "" });
const session = new Session(boardPosition, validMoves, player);

export default function Chess() {
    const boardOperationsRef = useRef<BoardOperations>({ flipBoard: () => { }, makeMove: () => { } });

    return (
        <div className="mainbody">
            <Board boardPosition={boardPosition} reportMove={session.reportMove}
                player={player} boardOperations={boardOperationsRef.current} validMoves={validMoves} />
            <button onClick={boardOperationsRef.current.flipBoard}>Flip Board</button>
        </div>
    );
}