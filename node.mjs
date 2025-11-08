import init from './dist/html_rewriter.js'
import fs from 'node:fs'
import url from 'node:url'

import { HTMLRewriterWrapper } from './dist/html_rewriter_wrapper.js'

const file = url.fileURLToPath(new url.URL('./dist/html_rewriter_bg.wasm', import.meta.url))

const bytes = fs.readFileSync(file)

const wasm = new WebAssembly.Module(bytes)

export const HTMLRewriter = HTMLRewriterWrapper(init(wasm))
