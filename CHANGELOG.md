# 🚧 Changelog

## 0.3.2

- Fix `Promise` detection for async handlers. `Promise`s in different realms
  will now be detected. Closes
  [issue #1](https://github.com/mrbbot/html-rewriter-wasm/issues/1).

## 0.3.1

- Change the return type of `Element.attributes` to `IterableIterator`
- Bind handlers' `this` in Rust

## 0.3.0

Initial Release
