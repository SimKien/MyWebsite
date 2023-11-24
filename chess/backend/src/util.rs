pub struct UniqueIdGenerator {
    id: u32,
}

impl UniqueIdGenerator {
    pub fn new() -> Self {
        Self { id: 0 }
    }

    pub fn setMin(&mut self, new_min: u32) {
        self.id = new_min;
    }

    pub fn generate(&mut self) -> u32 {
        let res = self.id;
        self.id += 1;
        res
    }
}
