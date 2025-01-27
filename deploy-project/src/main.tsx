import './index.css'
import { RouterProvider,createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen.ts'
import ReactDOM from 'react-dom/client';

const router = createRouter({
  routeTree
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <RouterProvider router={router} />,
  );
}