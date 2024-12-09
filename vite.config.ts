import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig(() => ({
  server: {
    port: 3000,
  },
  plugins: [
    tsconfigPaths({
      configNames: ['tsconfig.json'],
    }),
    TanStackRouterVite(),
    viteReact(),
    svgr(),
  ],
}))
