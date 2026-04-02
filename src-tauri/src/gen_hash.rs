use bcrypt::{hash, DEFAULT_COST};

fn main() {
    let password = "admin123";
    let hashed = hash(password, DEFAULT_COST).unwrap();
    println!("{}", hashed);
}
