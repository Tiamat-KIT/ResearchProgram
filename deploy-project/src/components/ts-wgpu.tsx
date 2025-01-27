import { useEffect } from 'react'
import complete from "../graphics/typescript/animate"

function Ts_View() {
    useEffect(() => {
        const targetSelector = "#stats-ts"
        const observerCallback = (mutationsList: MutationRecord[], observer: MutationObserver) => {
            for(const mutation of mutationsList) {
                if(mutation.type === "childList") {
                    const targetEl = document.querySelector(targetSelector)
                    if(targetEl) {
                        complete();
                    }
                }
            }
        }

        const observer = new MutationObserver(observerCallback)
        observer.observe(document.body, {childList: true, subtree: true})

        const initialCheck = document.querySelector(targetSelector)
        if(initialCheck) {
            complete();
        }   

        return () => observer.disconnect()
    }, [])

    return (
        <main>
            <section>
                {/**Reactが描画する対象 */}
                <div id="stats-ts" />
                <canvas id="ts-canvas" />
            </section>
        </main>
    )
}

export default Ts_View

