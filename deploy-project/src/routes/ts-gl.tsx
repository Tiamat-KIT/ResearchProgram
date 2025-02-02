import { createFileRoute } from '@tanstack/react-router'
import Gl_View from '../components/gl'

export const Route = createFileRoute('/ts-gl')({
  component: () => <Gl_View />,
})
