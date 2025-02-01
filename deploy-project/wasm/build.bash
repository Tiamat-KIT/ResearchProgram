cargo install wasm-opt
# RUSTFLAGS='--cfg getrandom_backend="wasm_js"'
rustup component add clippy
wasm-pack build --target web --reference-types --release --out-dir ../src/graphics/wasm