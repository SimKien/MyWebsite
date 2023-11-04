import Board from "pages/chess/components/Board";
import "pages/chess/style/Chess.css"
import "pages/chess/lib/websocket/Websocket"
import { Signal, signal } from "@preact/signals-react";
import { Session } from "pages/chess/lib/Game";
import { useEffect } from "react";

const boardPosition: Signal<string> = signal<string>("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
const session = signal<Session>(new Session());

export default function Chess() {

    useEffect(() => {
        session.value.generateSession();
        boardPosition.value = session.value.getBoardPosition();
    }, []);

    return (
        <div className="mainbody">
            <Board boardPosition={boardPosition.value} reportMove={session.value.reportMove} player={session.value.player} />
            <button onClick={() => { }}>Flip Board</button>
        </div>
    );
}