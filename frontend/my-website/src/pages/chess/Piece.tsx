import KingWhiteSVG from "assets/kingwhite.svg";
import KingBlackSVG from "assets/kingblack.svg";
import QueenWhiteSVG from "assets/queenwhite.svg";
import QueenBlackSVG from "assets/queenblack.svg";
import RookWhiteSVG from "assets/rookwhite.svg";
import RookBlackSVG from "assets/rookblack.svg";
import KnightWhiteSVG from "assets/knightwhite.svg";
import KnightBlackSVG from "assets/knightblack.svg";
import BishopWhiteSVG from "assets/bishopwhite.svg";
import BishopBlackSVG from "assets/bishopblack.svg";
import PawnWhiteSVG from "assets/pawnwhite.svg";
import PawnBlackSVG from "assets/pawnblack.svg";
import "pages/chess/Piece.css"
import { useEffect, useRef } from "react";

export type Position = [number, number];
export type PieceType = "K" | "Q" | "R" | "B" | "N" | "P";
export type PieceColor = 'white' | 'black';
export type PieceMap = { [K in PieceType]: (color: PieceColor) => JSX.Element };
export type PositionInfo = [PieceType | undefined, PieceColor | undefined];

export interface Piece {
    position: Position;
    type: PieceType;
    color: PieceColor;
}

const PIECE_MAP: PieceMap = {
    K: (color: PieceColor) => color === 'white' ? <img onDragStart={(e) => e.preventDefault()} className="piecesvg" src={KingWhiteSVG} alt="King White"></img> : <img onDragStart={(e) => e.preventDefault()} className="piecesvg" src={KingBlackSVG} alt="King Black"></img>,
    Q: (color: PieceColor) => color === 'white' ? <img onDragStart={(e) => e.preventDefault()} className="piecesvg" src={QueenWhiteSVG} alt="Queen White"></img> : <img onDragStart={(e) => e.preventDefault()} className="piecesvg" src={QueenBlackSVG} alt="Queen Black"></img>,
    R: (color: PieceColor) => color === 'white' ? <img onDragStart={(e) => e.preventDefault()} className="piecesvg" src={RookWhiteSVG} alt="Rook White"></img> : <img onDragStart={(e) => e.preventDefault()} className="piecesvg" src={RookBlackSVG} alt="Rook Black"></img>,
    B: (color: PieceColor) => color === 'white' ? <img onDragStart={(e) => e.preventDefault()} className="piecesvg" src={BishopWhiteSVG} alt="Bishop White"></img> : <img onDragStart={(e) => e.preventDefault()} className="piecesvg" src={BishopBlackSVG} alt="Bishop Black"></img>,
    N: (color: PieceColor) => color === 'white' ? <img onDragStart={(e) => e.preventDefault()} className="piecesvg" src={KnightWhiteSVG} alt="Knight White"></img> : <img onDragStart={(e) => e.preventDefault()} className="piecesvg" src={KnightBlackSVG} alt="Knight Black"></img>,
    P: (color: PieceColor) => color === 'white' ? <img onDragStart={(e) => e.preventDefault()} className="piecesvg" src={PawnWhiteSVG} alt="Pawn White"></img> : <img onDragStart={(e) => e.preventDefault()} className="piecesvg" src={PawnBlackSVG} alt="Pawn Black"></img>
};

export function PieceComponent(props: { piece: Piece | undefined, mainbodyef: React.RefObject<HTMLDivElement> }) {
    const piecedivref = useRef<HTMLDivElement>(null);

    const isClicked = useRef<boolean>(false);

    const zIndex = useRef<string>("0");

    const coords = useRef<{
        startx: number,
        starty: number,
        lastx: number,
        lasty: number
    }>({
        startx: 0,
        starty: 0,
        lastx: 0,
        lasty: 0
    });

    useEffect(() => {
        if (!props.mainbodyef.current || !piecedivref.current) return;

        const mainbody = props.mainbodyef.current;
        const piecediv = piecedivref.current;

        const onMouseDown = (e: MouseEvent) => {
            isClicked.current = true;
            zIndex.current = piecediv.style.zIndex;
            coords.current.startx = e.clientX;
            coords.current.starty = e.clientY;
            piecediv.style.zIndex = "1000";
        };

        const onMouseUp = (e: MouseEvent) => {
            isClicked.current = false;
            coords.current.lastx = piecediv.offsetLeft;
            coords.current.lasty = piecediv.offsetTop;
            piecediv.style.zIndex = zIndex.current.toString();
        };

        const onMouseMove = (e: MouseEvent) => {
            if (!isClicked.current) return;
            const nextx = e.clientX - coords.current.startx + coords.current.lastx;
            const nexty = e.clientY - coords.current.starty + coords.current.lasty;
            piecediv.style.left = `${nextx}px`;
            piecediv.style.top = `${nexty}px`;
        };

        piecediv.addEventListener("mousedown", onMouseDown);
        piecediv.addEventListener("mouseup", onMouseUp);
        mainbody.addEventListener("mousemove", onMouseMove);

        const cleanup = () => {
            piecediv.removeEventListener("mousedown", onMouseDown);
            piecediv.removeEventListener("mouseup", onMouseUp);
            mainbody.removeEventListener("mousemove", onMouseMove);
        }

        return cleanup;
    }, []);

    if (props.piece === undefined) {
        return <div ref={piecedivref} className="piececontainer"></div>;
    } else {
        return (
            <div ref={piecedivref} className="piececontainer">
                {PIECE_MAP[props.piece.type](props.piece.color)}
            </div>
        );
    }
}
