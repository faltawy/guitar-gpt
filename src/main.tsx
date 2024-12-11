import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { ThemeProvider } from './components/theme-provider'
import '@fontsource/geist-mono/400.css'
import '@fontsource/geist-mono/500.css'
import '@fontsource/geist-mono/600.css'
import '@fontsource/geist-mono/700.css'
import '@fontsource-variable/cairo'
import './index.css'
import { ProfileProvider } from './contexts/profile-context'
import { OnboardingDialog } from './components/onboarding-dialog'
import { Analytics } from '@vercel/analytics/react'
import { SettingsProvider } from './contexts/settings-context'
const isBotAgent = /bot|googlebot|crawler|spider|robot|crawling/i.test(
  navigator.userAgent,
)
const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultPendingMinMs: isBotAgent ? 100 : 0,
})

// Register things for typesafety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="guitar-gpt-theme">
      <QueryClientProvider client={queryClient}>
        <ProfileProvider>
          <SettingsProvider>
            <RouterProvider router={router} />
          </SettingsProvider>
          <OnboardingDialog />
        </ProfileProvider>
      </QueryClientProvider>
    </ThemeProvider>
    <Analytics />
  </React.StrictMode>,
)
