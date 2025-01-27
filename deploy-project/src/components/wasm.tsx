import { useEffect } from 'react'
import init from "../graphics/wasm/pkg/rust_pentagram";

function Wasm_View() {
    useEffect(() => {
        const targetSelector = "#stats"
        const observerCallback = (mutationsList: MutationRecord[], _observer: MutationObserver) => {
            for(const mutation of mutationsList) {
                if(mutation.type === "childList") {
                    const targetEl = document.querySelector(targetSelector)
                    if(targetEl) {
                        init().then(() => {
                            console.log("Wasm initialized")
                        })
                    }
                }
            }
        }

        const observer = new MutationObserver(observerCallback)
        observer.observe(document.body, {childList: true, subtree: true})

        const initialCheck = document.querySelector(targetSelector)
        if(initialCheck) {
            init().then(() => {
                console.log("Wasm initialized")
            })
        }   

        return () => observer.disconnect()
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

