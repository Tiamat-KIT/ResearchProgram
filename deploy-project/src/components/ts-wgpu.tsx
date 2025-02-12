import { useEffect } from 'react'
import complete from "../graphics/typescript/animate"

function Ts_View() {
    useEffect(() => {
        const targetSelector = "#stats-ts"
        const initialCheck = document.querySelector(targetSelector)
        if(initialCheck) {
            complete();
        }   
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

