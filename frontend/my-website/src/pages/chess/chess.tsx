import Board from "pages/chess/Board";
import "pages/chess/Chess.css"

export default function Chess() {

    return (
        <div className="mainbody">
            <Board fen={"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"} />
        </div>
    );
}