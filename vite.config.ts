import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { VitePWA } from 'vite-plugin-pwa'
import vercel from 'vite-plugin-vercel'

export default defineConfig(() => ({
  server: {
    port: 3000,
  },
  plugins: [
    tsconfigPaths({
      configNames: ['tsconfig.json'],
    }),
    vercel(),
    TanStackRouterVite(),
    viteReact(),
    svgr(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'script-defer',
      outDir: 'dist/assets',
      devOptions: {
        enabled: false,
      },
    }),
  ],
}))
