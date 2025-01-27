import { useEffect } from 'react'
import init from "../graphics/wasm/pkg/rust_pentagram";

function Wasm_View() {
    useEffect(() => {
        init().then(() => {
            console.log("Wasm initialized")
        })
    }, [])

    return (
        <main>
            <section id="container">
                {/**WebAssemblyが描画する対象 */}
                <div id="stats" />
            </section>
        </main>
    )
}

export default Wasm_View

