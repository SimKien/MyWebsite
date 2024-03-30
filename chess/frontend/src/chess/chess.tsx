import Board from "chess/components/Board";
import "chess/style/Chess.css"
import { signal } from "@preact/signals-react";
import { Player, Session, usePlayerStore } from "chess/lib/Game";
import { useEffect, useRef } from "react";
import { BoardOperations, Color, Move, PositionAbsolute } from "chess/lib/constants/ChessConstants";
import { SpecialMove } from "chess/lib/constants/CommunicationConstants";

const boardPosition = signal<string>("");
const validMoves = signal<Map<PositionAbsolute, PositionAbsolute[]>>(new Map<PositionAbsolute, PositionAbsolute[]>());
const player = signal<Player>({ color: Color.WHITE, id: "", token: "" });
const specialMoves = signal<SpecialMove[]>(new Array<SpecialMove>());
const session = new Session(boardPosition, validMoves, player, specialMoves);

export default function Chess() {
    const boardOperationsRef = useRef<BoardOperations>({ flipBoard: () => { }, makeMove: () => { } });

    const playerStore = usePlayerStore();

    const reportMove = (move: Move, specialMove: SpecialMove | undefined) => {
        session.reportMove(move, specialMove);
    }

    const loadGame = async () => {
        if (!playerStore.valid) {
            await session.createPlayer();
            playerStore.setId(session.player.value.id);
            playerStore.setToken(session.player.value.token);
            playerStore.setValid(true);
        } else {
            player.value = { color: Color.WHITE, id: playerStore.id, token: playerStore.token };
            session.player.value = { color: Color.WHITE, id: playerStore.id, token: playerStore.token }

            let valid = await session.isPlayerValid()
            if (!valid) {
                await session.createPlayer();
                playerStore.setId(session.player.value.id);
                playerStore.setToken(session.player.value.token);
                playerStore.setValid(true);
            }
        }
        await session.generateSession()
        session.connection?.addHandler(session.receiveMove);
    }

    useEffect(() => {
        void loadGame();
    }, [])

    useEffect(() => {
        session.makeMove = boardOperationsRef.current.makeMove;
    }, [boardOperationsRef.current.makeMove]);

    return (
        <div className="mainbody">
            <Board boardPosition={boardPosition} reportMove={reportMove}
                player={player} boardOperations={boardOperationsRef.current} validMoves={validMoves} specialMoves={specialMoves} />
            <button onClick={() => { boardOperationsRef.current.flipBoard() }}>Flip Board</button>
        </div>
    );
}