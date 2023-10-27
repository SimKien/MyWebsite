import Board from "pages/chess/Board";
import { useRef } from "react";
import "pages/chess/Chess.css"

export default function Chess() {
    const mainbodyref = useRef<HTMLDivElement>(null);

    return (
        <div ref={mainbodyref} className="mainbody">
            <Board mainbodyref={mainbodyref} />
        </div>
    );
}