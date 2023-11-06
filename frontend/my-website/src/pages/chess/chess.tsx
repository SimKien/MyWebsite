import Board from "pages/chess/components/Board";
import "pages/chess/style/Chess.css"
import "pages/chess/lib/websocket/Websocket"
import { Signal, signal } from "@preact/signals-react";
import { Session } from "pages/chess/lib/Game";
import { useEffect, useRef } from "react";
import { BoardOperations } from "pages/chess/lib/constants/ChessConstants";

const boardPosition: Signal<string> = signal<string>("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
const session = signal<Session>(new Session());

export default function Chess() {

    const boardOperationsRef = useRef<BoardOperations>({ flipBoard: () => { }, makeMove: () => { } });

    useEffect(() => {
        session.value.generateSession();
        boardPosition.value = session.value.boardPosition;
    }, [boardPosition.value]);

    return (
        <div className="mainbody">
            <Board boardPosition={boardPosition.value} reportMove={session.value.reportMove} player={session.value.player} boardOperations={boardOperationsRef.current} />
            <button onClick={boardOperationsRef.current.flipBoard}>Flip Board</button>
        </div>
    );
}