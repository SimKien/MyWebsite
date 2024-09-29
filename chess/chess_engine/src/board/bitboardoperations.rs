use crate::{Bitboard, BOARD_SIZE};

impl Bitboard {
    pub fn empty() -> Bitboard {
        Bitboard { board: 0 }
    }

    pub fn full() -> Bitboard {
        return Bitboard {
            board: 0xFFFFFFFFFFFFFFFF,
        };
    }

    pub fn to_string(&self) -> String {
        let mut result = String::new();
        for i in 0..64 {
            if self.board & (1 << (63 - i)) != 0 {
                result.push('1');
            } else {
                result.push('0');
            }
            if i % 8 == 7 {
                result.push('\n');
            } else {
                result.push(' ');
            }
        }
        return result;
    }

    pub fn set_bit(&mut self, index: u8) {
        self.board |= 1 << index;
    }

    pub fn clear_bit(&mut self, index: u8) {
        self.board &= !(1 << index);
    }

    pub fn get_bit(&self, index: u8) -> bool {
        return (self.board & (1 << index)) != 0;
    }

    pub fn move_up(&mut self, amount: i8) -> bool {
        if amount > 0 {
            for _ in 0..amount {
                if self.is_top_edge() {
                    return false;
                }
                self.board = self.board << BOARD_SIZE;
            }
        } else {
            for _ in 0..-amount {
                if self.is_bottom_edge() {
                    return false;
                }
                self.board = self.board >> BOARD_SIZE;
            }
        }
        return true;
    }

    pub fn move_right(&mut self, amount: i8) -> bool {
        if amount > 0 {
            for _ in 0..amount {
                if self.is_right_edge() {
                    return false;
                }
                self.board = self.board >> 1;
            }
        } else {
            for _ in 0..-amount {
                if self.is_left_edge() {
                    return false;
                }
                self.board = self.board << 1;
            }
        }
        return true;
    }

    pub fn is_top_edge(&self) -> bool {
        return self.board & 0xFF00000000000000 != 0;
    }

    pub fn is_bottom_edge(&self) -> bool {
        return self.board & 0x00000000000000FF != 0;
    }

    pub fn is_right_edge(&self) -> bool {
        return self.board & 0x0101010101010101 != 0;
    }

    pub fn is_left_edge(&self) -> bool {
        return self.board & 0x8080808080808080 != 0;
    }
    pub fn is_second_rank(&self) -> bool {
        return self.board & 0x000000000000FF00 != 0;
    }

    pub fn is_seventh_rank(&self) -> bool {
        return self.board & 0x00FF000000000000 != 0;
    }
}
