import { Signal } from "@preact/signals-react";
import "chess/style/pages/multiplayergame/Board.css"
import Square from "chess/components/pages/multiplayergame/Square";
import { BoardSize, PositionRelative } from "chess/lib/constants/BoardConstants";

// This is the board component
// It uses the board context to get information about moves and to report moves

export default function Board(props: {board: Signal<string[][]>}) {
    return (
        <div className="board_main">
            {props.board.value.map((row, i) => {
                return (
                    <div className="board_row" key={i} style={{height:`${100.0 / BoardSize}%`}}>
                        {row.map((piece, j) => {
                            const position: PositionRelative = [i, j]
                            return (
                                <Square piece={piece} key={j} positionRelative={position} />
                            )
                        })}
                    </div>
                )
            })}
        </div>
    )
}