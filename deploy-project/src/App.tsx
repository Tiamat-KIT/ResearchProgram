import { useEffect,useState } from 'react'
import complete from "./graphics/typescript/animate"
import init from "./graphics/wasm/pkg";

function App() {
  const [toggle,setToggle] = useState(false)
  useEffect(() => {
    if (toggle) {
      init().then((wasm) => {
        wasm.run();
      });
    } else {
      complete();
    }
  }, [toggle])

  return (
    <main>
      {toggle ? <section id="container">
        {/**WebAssemblyが描画する対象 */}
        <div id="stats" />
      </section> : 
      <section>
        {/**Reactが描画する対象 */}
        <div id="stas-ts" />
        <canvas id="ts-canvas" />
      </section>}
      <button onClick={() => setToggle(!toggle)}>
        Toggle change to `${toggle ? "React" : "WebAssembly"}`
      </button> 
    </main>
  )
}

export default App

