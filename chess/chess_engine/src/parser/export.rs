use crate::types::Position;

/*
    Converts a position bitboard into a position string
*/
pub fn get_position_string_from_position(pos: &Position) -> String {
    let mut column = 0;
    let mut row = 0;
    for i in 0..64 {
        if pos.board & (1 << i) != 0 {
            column = 7 - i % 8;
            row = i / 8;
            break;
        }
    }
    let column_char = ('a' as u8 + column) as char;
    let row_char = ('1' as u8 + row) as char;
    return format!("{}{}", column_char, row_char);
}

/*
    Returns whether the position is valid
*/
pub fn position_valid(pos: &Position) -> bool {
    let mut num_bits = 0;
    for i in 0..64 {
        if pos.board & (1 << i) != 0 {
            num_bits += 1;
        }
    }
    return num_bits == 1;
}
