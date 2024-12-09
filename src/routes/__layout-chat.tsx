import { createFileRoute, Outlet } from '@tanstack/react-router'

import { ConversationsAside } from '@/components/chat-interface/ConversationsAside'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { ChatProvider } from '@/contexts/chat-context'

export const Route = createFileRoute('/__layout-chat')({
  component: () => (
    <SidebarProvider>
      <ChatProvider>
        <ConversationsAside />
        <SidebarInset>
          <Outlet />
        </SidebarInset>
      </ChatProvider>
    </SidebarProvider>
  ),
})
