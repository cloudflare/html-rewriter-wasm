#!/usr/bin/env bash
set -e

echo "---> Checking wasm-pack version..."
# We need to make sure the version of wasm-pack uses Binaryen version_92,
# which exports asyncify_get_state
WASM_PACK_VERSION=$(wasm-pack --version)
if [[ ! $WASM_PACK_VERSION =~ -asyncify$ ]]; then
  echo "$WASM_PACK_VERSION installed, please install mrbbot's fork:"
  echo "cargo install --git https://github.com/mrbbot/wasm-pack"
  exit 1
fi

echo "---> Building WebAssembly with wasm-pack..."
wasm-pack build --target nodejs

echo "---> Patching JavaScript glue code..."
# Wraps write/end with asyncify magic and adds this returns for chaining
# diff -uN pkg/html_rewriter.js pkg2/html_rewriter.js > html_rewriter.js.patch
patch -uN pkg/html_rewriter.js < html_rewriter.js.patch

echo "---> Copying required files to dist..."
mkdir -p dist
cp pkg/html_rewriter.js dist/html_rewriter.js
cp pkg/html_rewriter_bg.wasm dist/html_rewriter_bg.wasm
cp src/asyncify.js dist/asyncify.js
cp src/html_rewriter.d.ts dist/html_rewriter.d.ts
