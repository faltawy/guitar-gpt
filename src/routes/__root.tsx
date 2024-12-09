import { createRootRoute, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => {
    return (
      <p className="flex justify-center items-center bg-background w-full h-dvh text-foreground">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl">404</h1>
          <span className="bg-accent w-px h-10" />
          <span className="text-sm">This page could not be found</span>
        </div>
      </p>
    )
  },
})

export default function RootLayout() {
  return (
    <div className="w-dvw h-dvh overflow-hidden">
      <Outlet />
    </div>
  )
}
