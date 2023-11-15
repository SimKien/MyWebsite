import Board from "pages/chess/components/Board";
import "pages/chess/style/Chess.css"
import "pages/chess/lib/websocket/Websocket"
import { signal } from "@preact/signals-react";
import { Player, Session, usePlayerStore } from "pages/chess/lib/Game";
import { useEffect, useRef } from "react";
import { BoardOperations, Color, PositionAbsolute, SpecialMove } from "pages/chess/lib/constants/ChessConstants";


const boardPosition = signal<string>("");
const validMoves = signal<Map<PositionAbsolute, PositionAbsolute[]>>(new Map<PositionAbsolute, PositionAbsolute[]>());
const player = signal<Player>({ color: Color.WHITE, id: "", token: "" });
const specialMoves = signal<SpecialMove[]>(new Array<SpecialMove>());
const session = new Session(boardPosition, validMoves, player, specialMoves);

export default function Chess() {
    const boardOperationsRef = useRef<BoardOperations>({ flipBoard: () => { }, makeMove: () => { } });

    const playerStore = usePlayerStore();

    const loadGame = async () => {
        if (!playerStore.valid) {
            await session.createPlayer();
            playerStore.setId(session.player.value.id);
            playerStore.setToken(session.player.value.token);
            playerStore.setValid(true);
        } else {
            player.value = { color: Color.WHITE, id: playerStore.id, token: playerStore.token };
        }
        await session.generateSession()
    }

    useEffect(() => {
        void loadGame();
    }, [])

    return (
        <div className="mainbody">
            <Board boardPosition={boardPosition} reportMove={session.reportMove}
                player={player} boardOperations={boardOperationsRef.current} validMoves={validMoves} specialMoves={specialMoves} />
            <button onClick={boardOperationsRef.current.flipBoard}>Flip Board</button>
        </div>
    );
}