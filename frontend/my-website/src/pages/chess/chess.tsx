import Board from "pages/chess/components/Board";
import "pages/chess/style/Chess.css"
import "pages/chess/lib/websocket/Websocket"
import { Signal, signal } from "@preact/signals-react";
import { Player, usePlayerStore, Session } from "pages/chess/lib/Game";
import { useEffect, useRef } from "react";
import { BoardOperations, Color, PieceColor, PositionAbsolute } from "pages/chess/lib/constants/ChessConstants";


const boardPosition: Signal<string> = signal<string>("");
const validMoves = signal<Map<PositionAbsolute, PositionAbsolute[]>>(new Map<PositionAbsolute, PositionAbsolute[]>());
const player = signal<Player>({ color: Color.White, id: "", token: "" });
const session = signal<Session>(new Session(boardPosition, validMoves, player));

export default function Chess() {
    const playerStore = usePlayerStore();

    const boardOperationsRef = useRef<BoardOperations>({ flipBoard: () => { }, makeMove: () => { } });

    useEffect(() => {
        if (!playerStore.valid) {
            playerStore.setId(session.value.player.value.id);
            playerStore.setToken(session.value.player.value.token);
            playerStore.setValid(true);
            return;
        }
        session.value.player.value = { ...playerStore, color: Color.White };
    }, []);

    console.log("render")

    return (
        <div className="mainbody">
            <Board boardPosition={boardPosition} reportMove={session.value.reportMove}
                player={player} boardOperations={boardOperationsRef.current} validMoves={validMoves} />
            <button onClick={() => session.value.player.value = { color: Color.Black, id: "", token: "" }}>Flip Board</button>
        </div>
    );
}