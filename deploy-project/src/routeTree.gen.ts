/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { createFileRoute } from '@tanstack/react-router'

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as WasmGpuImport } from './routes/wasm-gpu'
import { Route as TsGpuImport } from './routes/ts-gpu'
import { Route as TsGlImport } from './routes/ts-gl'

// Create Virtual Routes

const IndexLazyImport = createFileRoute('/')()

// Create/Update Routes

const WasmGpuRoute = WasmGpuImport.update({
  id: '/wasm-gpu',
  path: '/wasm-gpu',
  getParentRoute: () => rootRoute,
} as any)

const TsGpuRoute = TsGpuImport.update({
  id: '/ts-gpu',
  path: '/ts-gpu',
  getParentRoute: () => rootRoute,
} as any)

const TsGlRoute = TsGlImport.update({
  id: '/ts-gl',
  path: '/ts-gl',
  getParentRoute: () => rootRoute,
} as any)

const IndexLazyRoute = IndexLazyImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/index.lazy').then((d) => d.Route))

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexLazyImport
      parentRoute: typeof rootRoute
    }
    '/ts-gl': {
      id: '/ts-gl'
      path: '/ts-gl'
      fullPath: '/ts-gl'
      preLoaderRoute: typeof TsGlImport
      parentRoute: typeof rootRoute
    }
    '/ts-gpu': {
      id: '/ts-gpu'
      path: '/ts-gpu'
      fullPath: '/ts-gpu'
      preLoaderRoute: typeof TsGpuImport
      parentRoute: typeof rootRoute
    }
    '/wasm-gpu': {
      id: '/wasm-gpu'
      path: '/wasm-gpu'
      fullPath: '/wasm-gpu'
      preLoaderRoute: typeof WasmGpuImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexLazyRoute
  '/ts-gl': typeof TsGlRoute
  '/ts-gpu': typeof TsGpuRoute
  '/wasm-gpu': typeof WasmGpuRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexLazyRoute
  '/ts-gl': typeof TsGlRoute
  '/ts-gpu': typeof TsGpuRoute
  '/wasm-gpu': typeof WasmGpuRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexLazyRoute
  '/ts-gl': typeof TsGlRoute
  '/ts-gpu': typeof TsGpuRoute
  '/wasm-gpu': typeof WasmGpuRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/ts-gl' | '/ts-gpu' | '/wasm-gpu'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/ts-gl' | '/ts-gpu' | '/wasm-gpu'
  id: '__root__' | '/' | '/ts-gl' | '/ts-gpu' | '/wasm-gpu'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexLazyRoute: typeof IndexLazyRoute
  TsGlRoute: typeof TsGlRoute
  TsGpuRoute: typeof TsGpuRoute
  WasmGpuRoute: typeof WasmGpuRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexLazyRoute: IndexLazyRoute,
  TsGlRoute: TsGlRoute,
  TsGpuRoute: TsGpuRoute,
  WasmGpuRoute: WasmGpuRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/ts-gl",
        "/ts-gpu",
        "/wasm-gpu"
      ]
    },
    "/": {
      "filePath": "index.lazy.tsx"
    },
    "/ts-gl": {
      "filePath": "ts-gl.tsx"
    },
    "/ts-gpu": {
      "filePath": "ts-gpu.tsx"
    },
    "/wasm-gpu": {
      "filePath": "wasm-gpu.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
