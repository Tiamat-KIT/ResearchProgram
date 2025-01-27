import { useEffect } from 'react'
import complete from "./graphics/typescript/animate"
import init from "./graphics/wasm/pkg";

function App() {
  useEffect(() => {
    (async () => {
      await complete();
      (await init()).run();
    })()
  }, [])

  return (
    <main>
      <section id="container">
        {/**WebAssemblyが描画する対象 */}
        <div id="stats" />
      </section>
      <section>
        {/**Reactが描画する対象 */}
        <div id="stas-ts" />
        <canvas id="ts-canvas" />
      </section>

    </main>
  )
}

export default App
