import { Link } from '@tanstack/react-router';

function App() {

  return (
    <main>
      <h1>
        Research Project
      </h1>
      <section>
        <Link to="/ts-gpu">従来法</Link>
        <Link to="/wasm-gpu">提案法</Link>
        <Link to="/ts-gl">従来法（WebGL）</Link>
      </section>
    </main>
  )
}

export default App

