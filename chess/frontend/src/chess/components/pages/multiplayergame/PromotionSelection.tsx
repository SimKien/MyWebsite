import { Piece_names, PieceColor, PieceType } from "chess/lib/constants/ChessConstants";
import { promotionPieceOpacity } from "chess/lib/constants/StyleConstants";
import { PIECE_MAP } from "chess/components/pages/multiplayergame/Piece";
import "chess/style/pages/multiplayergame/PromotionSelection.css"

export default function PromotionSelection(props: { color: PieceColor, reportSelection: (piece: PieceType) => void }) {
    return (
        <div className="promotionSelection_main">
            <div className="promotionSelection_item" onClick={() => props.reportSelection(Piece_names.Queen as PieceType)}>
                {PIECE_MAP[Piece_names.Queen as PieceType](props.color, promotionPieceOpacity)}
            </div>
            <div className="promotionSelection_item" onClick={() => props.reportSelection(Piece_names.Rook as PieceType)}>
                {PIECE_MAP[Piece_names.Rook as PieceType](props.color, promotionPieceOpacity)}
            </div>
            <div className="promotionSelection_item" onClick={() => props.reportSelection(Piece_names.Bishop as PieceType)}>
                {PIECE_MAP[Piece_names.Bishop as PieceType](props.color, promotionPieceOpacity)}
            </div>
            <div className="promotionSelection_item" onClick={() => props.reportSelection(Piece_names.Knight as PieceType)}>
                 {PIECE_MAP[Piece_names.Knight as PieceType](props.color, promotionPieceOpacity)}
            </div>
        </div>
    )
}