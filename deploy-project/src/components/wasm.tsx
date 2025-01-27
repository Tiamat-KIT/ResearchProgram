import { useRef } from 'react'
import init from "../graphics/wasm/pkg/rust_pentagram";
import { useInView } from '../hooks/useInView';

function Wasm_View() {
    const statsRef = useRef<HTMLDivElement>(null)
    let exist = useInView(statsRef)
    if(exist) {
        init()
    }
    return (
        <main>
            <section id="container">
                {/**WebAssemblyが描画する対象 */}
                <div id="stats" ref={statsRef} />
            </section>
        </main>
    )
}

export default Wasm_View

