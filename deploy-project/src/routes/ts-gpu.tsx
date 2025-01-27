import { createFileRoute } from '@tanstack/react-router'
import Ts_View from '../components/ts-wgpu'

export const Route = createFileRoute('/ts-gpu')({
  component: () => <Ts_View />,
})
