import { signal } from "@preact/signals-react";
import { BoardSize, PositionAbsolute } from "chess/lib/constants/BoardConstants";
import { Color } from "chess/lib/constants/ChessConstants";
import { SpecialMove } from "chess/lib/constants/CommunicationConstants";
import { Player } from "chess/lib/constants/UserConstants";
import { UserContext } from "chess/lib/contexts/UserContext";
import { Game } from "chess/lib/Game";
import { loadPosition } from "chess/lib/utility/BoardOperations";
import { useContext, useEffect, useRef } from "react";
import Board from "chess/components/pages/multiplayergame/Board";

export default function MultiplayerGame() {
    const userContext = useContext(UserContext)

    const fetchedBoardPosition = signal<string>("")
    const validMoves = signal<Map<PositionAbsolute, PositionAbsolute[]>>(new Map<PositionAbsolute, PositionAbsolute[]>())
    const specialMoves = signal<SpecialMove[]>(new Array<SpecialMove>())
    const player = signal<Player>({user: userContext, color: Color.WHITE})

    const gameRef = useRef<Game>(new Game(fetchedBoardPosition, validMoves, specialMoves, userContext, player))

    useEffect(() => {
        void gameRef.current.generateSession()
    }, [])

    const board = signal<string[][]>(new Array(BoardSize).fill(new Array(BoardSize).fill("")))

    useEffect(() => {
        board.value = loadPosition(fetchedBoardPosition.value, BoardSize)
    }, [fetchedBoardPosition.value])

    return (
        <div>
            <Board board={board} />
        </div>
    );
}