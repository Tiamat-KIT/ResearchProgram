import { useLayoutEffect } from 'react'
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
        init().then(() => {
            console.log("Wasm initialized")
        })

        // コンポーネントがアンマウントされた時にstatsElを削除
        return () => {
            containerEl?.removeChild(statsEl)
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

