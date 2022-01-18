# 🚧 Changelog

## 0.4.0

- Add support for `Element#onEndTag`
- Add support for the
  [`html_rewriter_treats_esi_include_as_void_tag`](https://developers.cloudflare.com/workers/platform/compatibility-dates#htmlrewriter-handling-of-esiinclude)
  compatibility flag
- Throw a `TypeError` instead of a `string` when a content token is used outside
  the relevant content handler

## 0.3.3

- Make `Promise` detection for async handlers stricter

## 0.3.2

- Fix `Promise` detection for async handlers. `Promise`s in different realms
  will now be detected. Closes
  [issue #1](https://github.com/mrbbot/html-rewriter-wasm/issues/1).

## 0.3.1

- Change the return type of `Element#attributes` to `IterableIterator`
- Bind handlers' `this` in Rust

## 0.3.0

Initial Release
