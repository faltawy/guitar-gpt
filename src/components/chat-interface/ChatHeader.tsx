import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import { useChat } from '@/contexts/chat-context'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Menu, Music, Settings, Moon, Sun, Monitor } from 'lucide-react'
import { useSettings } from '@/lib/stores/settings'
import { useTheme } from '@/components/theme-provider'
import { useState } from 'react'
import { AboutDialog } from '@/components/about-dialog'

export function ChatHeader() {
  const { toggleSidebar } = useSidebar()
  const { setTheme } = useTheme()
  const { clearHistory } = useSettings()
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const { activeSessionId, sessions } = useChat()

  const activeSession = sessions.find((s) => s.id === activeSessionId)

  return (
    <header className="bg-background">
      <div className="flex h-14 items-center gap-4 px-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => toggleSidebar()}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-medium">Guitar GPT</h1>
              {activeSession && (
                <>
                  <span className="text-muted-foreground">/</span>
                  <span className="text-sm text-muted-foreground">
                    {activeSession.title}
                  </span>
                </>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span>Theme</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup
                      value={useSettings.getState().theme}
                      onValueChange={(value) =>
                        setTheme(value as 'light' | 'dark' | 'system')
                      }
                    >
                      <DropdownMenuRadioItem value="light">
                        <Sun className="mr-2 h-4 w-4" />
                        Light
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="dark">
                        <Moon className="mr-2 h-4 w-4" />
                        Dark
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="system">
                        <Monitor className="mr-2 h-4 w-4" />
                        System
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    Clear History
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear Chat History</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete your entire chat history.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={clearHistory}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Clear History
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <AboutDialog
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    About
                  </DropdownMenuItem>
                }
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
