import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { VitePWA } from 'vite-plugin-pwa'
import vercel from 'vite-plugin-vercel'

export default defineConfig(({ mode }) => ({
  server: {
    port: 3000,
    strictPort: true,
    host: true,
    cors: true,
    hmr: {
      overlay: true,
    },
    watch: {
      usePolling: true,
    },
  },
  plugins: [
    tsconfigPaths(),
    vercel(),
    TanStackRouterVite(),
    viteReact(),
    svgr(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'script-defer',
      outDir: 'dist/assets',
      manifest: {
        name: 'Guitar GPT',
        short_name: 'GuitarGPT',
        description: 'AI-powered guitar companion',
        theme_color: '#000000',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/guitar-bot.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/guitar-bot.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'guitar-vendor': ['react-guitar', 'react-guitar-sound', 'tone'],
          'ui-vendor': [
            '@radix-ui/react-avatar',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
          ],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react-guitar', 'tone'],
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __DEV_MODE__: mode === 'development',
  },
  envPrefix: ['VITE_', 'GUITAR_GPT_'],
  assetsInclude: ['**/*.mp3', '**/*.wav'],
  publicDir: 'public',
  base: './',
  resolve: {
    alias: [
      { find: '@sounds', replacement: '/src/assets/sounds' },
      { find: '@images', replacement: '/src/assets/images' },
    ],
  },
}))
