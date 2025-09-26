#!/usr/bin/env bash
set -e

echo "---> Checking prerequisites..."
WASM_BINDGEN_VERSION=$(wasm-bindgen --version)
if [[ ! $WASM_BINDGEN_VERSION =~ "0.2.74" ]]; then
  echo "wasm-bindgen@0.2.74 not installed, please install via:"
  echo "cargo +1.77.0 install wasm-bindgen-cli@0.2.74"
  exit 1
fi

WASM_OPT_VERSION=$(wasm-opt --version)
if [[ ! $WASM_OPT_VERSION =~ wasm-opt ]]; then
  echo "wasm-opt not installed, please install from Binaryen:"
  echo "https://github.com/WebAssembly/binaryen"
  exit 1
fi

rustup target add wasm32-unknown-unknown

echo "---> Building WebAssembly with wasm-bindgen..."
cargo build --target wasm32-unknown-unknown --release
wasm-bindgen target/wasm32-unknown-unknown/release/html_rewriter.wasm --target nodejs --out-dir dist
wasm-opt dist/html_rewriter_bg.wasm -o dist/html_rewriter_bg.wasm --asyncify -Os

echo "---> Patching JavaScript glue code..."
# Wraps write/end with asyncify magic and adds this returns for chaining
# cp dist/html_rewriter.js dist/html_rewriter.js.orig
# diff -uN dist/html_rewriter.js.orig dist/html_rewriter.js > html_rewriter.js.patch
patch -uN dist/html_rewriter.js < html_rewriter.js.patch

echo "---> Copying required files to dist..."
cp src/asyncify.js dist/asyncify.js
cp src/html_rewriter.d.ts dist/html_rewriter.d.ts
