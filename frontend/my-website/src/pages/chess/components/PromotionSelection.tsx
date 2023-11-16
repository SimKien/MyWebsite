import "pages/chess/style/PromotionSelection.css"
import { PIECE_MAP } from "pages/chess/components/Piece"
import { PieceColor, PieceType, Piece_names } from "pages/chess/lib/constants/ChessConstants";

const promotionPieceOpacity = "1.0"

export default function PromotionSelection(props: { color: PieceColor, reportSelection: (piece: PieceType) => void }) {
    return (
        <div className="promotionSelectionContainer">
            <div className="promotionSelectionRow">
                <div className="promotionSelectionSquare" onClick={() => props.reportSelection(Piece_names.Queen as PieceType)}>
                    {PIECE_MAP[Piece_names.Queen as PieceType](props.color, promotionPieceOpacity)}
                </div>
                <div className="promotionSelectionSquare" onClick={() => props.reportSelection(Piece_names.Rook as PieceType)}>
                    {PIECE_MAP[Piece_names.Rook as PieceType](props.color, promotionPieceOpacity)}
                </div>
            </div>
            <div className="promotionSelectionRow">
                <div className="promotionSelectionSquare" onClick={() => props.reportSelection(Piece_names.Bishop as PieceType)}>
                    {PIECE_MAP[Piece_names.Bishop as PieceType](props.color, promotionPieceOpacity)}
                </div>
                <div className="promotionSelectionSquare" onClick={() => props.reportSelection(Piece_names.Knight as PieceType)}>
                    {PIECE_MAP[Piece_names.Knight as PieceType](props.color, promotionPieceOpacity)}
                </div>
            </div>
        </div>
    )
}