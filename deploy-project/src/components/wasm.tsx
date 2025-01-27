import { useEffect, useLayoutEffect } from 'react'
import init from "../graphics/wasm/pkg/rust_pentagram";
// import { useInView } from '../hooks/useInView';

function Wasm_View() {
    useLayoutEffect(() => {
        // statsというidを持つ要素を追加
        const statsEl = document.createElement("div")
        statsEl.id = "stats"

        // containerというidを持つ要素に対してstatsElを追加
        const containerEl = document.getElementById("container")
        containerEl?.appendChild(statsEl)

        // WebAssemblyの初期化
        init().then((wasm) => {
            console.log("Wasm initialized")
            wasm.__wbindgen_start()
        })

        // コンポーネントがアンマウントされた時にstatsElを削除
        return () => {
            containerEl?.removeChild(statsEl)
        }
    }, [])

    useEffect(() => {
        return () => {

        }
    }, [])
    return (
        <main>
            <section id="container">
                {/**WebAssemblyが描画する対象 */}
            </section>
        </main>
    )
}

export default Wasm_View

