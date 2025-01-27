import { useEffect } from 'react'
import complete from "./graphics/typescript/animate"
import init from "./graphics/wasm/rust_pentagram.js";

function App() {
  useEffect(() => {
    (async () => {
      await complete()
      await init()
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
