import { useSignal, useSignalEffect } from "@preact/signals-react";
import { BoardInformation, BoardSize, Move, PositionAbsolute } from "chess/lib/constants/BoardConstants";
import { Color, PieceColor } from "chess/lib/constants/ChessConstants";
import { SpecialMove } from "chess/lib/constants/CommunicationConstants";
import { Player } from "chess/lib/constants/UserConstants";
import { UserContext } from "chess/lib/contexts/UserContext";
import { Game } from "chess/lib/Game";
import { getRelativePosition, loadPosition, movePiece, turnBoard } from "chess/lib/utility/BoardOperations";
import { useContext, useEffect } from "react";
import Board from "chess/components/pages/multiplayergame/Board";
import "chess/style/pages/multiplayergame/MultiplayerGame.css";
import { defaultBoardContext } from "chess/lib/constants/ContextConstants";
import { BoardContext } from "chess/lib/contexts/BoardContext";
import MovesBoard from "chess/components/pages/multiplayergame/MovesBoard";
import OptionBar from "chess/components/pages/multiplayergame/OptionBar";

export default function MultiplayerGame() {
    // context hooks
    const userContext = useContext(UserContext)
    
    // variables for the game
    const fetchedBoardPosition = useSignal<string>("")
    const validMoves = useSignal<Map<PositionAbsolute, PositionAbsolute[]>>(new Map<PositionAbsolute, PositionAbsolute[]>())
    const specialMoves = useSignal<SpecialMove[]>(new Array<SpecialMove>())
    const player = useSignal<Player>({user: userContext, color: Color.WHITE})
    const board = useSignal<string[][]>(new Array(BoardSize).fill(new Array(BoardSize).fill("")))
    const orientation = useSignal<PieceColor>(Color.WHITE)
    const boardContext = useSignal<BoardInformation>(defaultBoardContext)
    const game = new Game(fetchedBoardPosition, validMoves, specialMoves, userContext, player)
    
    // handlers
    const turnBoardHandler = () => {
        board.value = turnBoard(board.value)
        orientation.value = orientation.value === Color.WHITE ? Color.BLACK : Color.WHITE
    }

    const makeClientMove = (move: Move, specialMove: SpecialMove | undefined) => {
        board.value = movePiece(move, board.value, specialMove);
        game.reportMove(move, specialMove);
    }

    const makeServerMove = (move: Move, specialMove: SpecialMove | undefined) => {
        move.fromRelative = getRelativePosition(move.fromAbsolute as PositionAbsolute, orientation.value);
        move.toRelative = getRelativePosition(move.toAbsolute as PositionAbsolute, orientation.value)

        board.value = movePiece(move, board.value, specialMove);
    }

    // react hooks
    useEffect(() => {
        void game.generateSession(makeServerMove)
    }, [])

    useSignalEffect(() => {
        board.value = loadPosition(fetchedBoardPosition.value)
        if (player.value.color === Color.BLACK) {
            board.value = turnBoard(board.value)
            orientation.value = Color.BLACK
            return
        }
        orientation.value = Color.WHITE
    })

    useSignalEffect(() => {
        const newBoardContext: BoardInformation = {
            validMoves: validMoves.value,
            specialMoves: specialMoves.value,
            orientation: orientation.value,
            makeClientMove: makeClientMove
        }
        boardContext.value = newBoardContext
    })

    return (
        <div className="multiplayergame_main">
            <div className="multiplayergame_header">
                Header
            </div>
            <div className="multiplayergame_body">
                <BoardContext.Provider value={boardContext.value}>
                    <Board board={board} />
                </BoardContext.Provider>
                <MovesBoard />
                <OptionBar turnboardHandler={turnBoardHandler} />
            </div>
            <div className="multiplayergame_footer">
                Footer
            </div>
        </div>
    );
}