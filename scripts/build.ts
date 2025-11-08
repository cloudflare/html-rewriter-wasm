import { callMain, shell } from '@xmorse/deployment-utils'
import path from 'path'
import fs from 'fs-extra'

async function main() {
    await fs.rm(`dist`, { recursive: true, force: true })

    await shell(`cargo +1.82.0 install wasm-bindgen-cli@0.2.74`)
    await shell(`rustup target add wasm32-unknown-unknown`)
    await shell(`cargo build --target wasm32-unknown-unknown --release`)
    await shell(`wasm-bindgen target/wasm32-unknown-unknown/release/html_rewriter.wasm --target web --out-dir dist`)
    await shell(`wasm-opt dist/html_rewriter_bg.wasm -o dist/html_rewriter_bg.wasm --asyncify -Os`)

    await shell(`patch -uN dist/html_rewriter.js < html_rewriter.js.patch`)
    await fs.rm('dist/html_rewriter.js.orig')

    await fs.copy(`src`, `dist`, {
        filter(p) {
            // console.log(p)
            return !path.extname(p) || p.endsWith('.d.ts')
        },
    })
    await shell(`pnpm tsc `)
    await fs.copy(`src/asyncify.js`, `dist/asyncify.js`, {})

    // createa a file base64.js that exports the wasm as a base64 string
    // await fs.writeFile(
    //     `dist/base64.wasm.js`,
    //     `export default "${await fs.readFile(
    //         `dist/html_rewriter_bg.wasm`,
    //         {
    //             encoding: 'base64',
    //         },
    //     )}"`,
    // )
}

main()
