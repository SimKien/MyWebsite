/*
    Checks if a vector only contains unique elements.
*/
pub fn is_vector_unique<T: PartialEq>(vec: Vec<T>) -> bool {
    let mut found = Vec::new();
    for item in vec {
        if !found.contains(&item) {
            found.push(item);
        } else {
            return false;
        }
    }
    return true;
}
