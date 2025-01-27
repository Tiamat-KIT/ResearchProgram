import { createFileRoute } from '@tanstack/react-router'
import Wasm_View from '../components/wasm'

export const Route = createFileRoute('/wasm-gpu')({
  component: () => <Wasm_View />,
})
