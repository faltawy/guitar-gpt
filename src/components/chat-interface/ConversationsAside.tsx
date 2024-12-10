import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageSquare, MoreVertical, Plus, User, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarRail,
} from '../ui/sidebar'
import { useChat } from '@/contexts/chat-context'
import { useProfile } from '@/contexts/profile-context'
import type { ChatSession } from '@/lib/db'
import { Input } from '@/components/ui/input'
import { useState, useRef, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import { useSettings } from '@/lib/stores/settings'

export function ConversationsAside() {
  const {
    sessions,
    activeSessionId,
    setActiveSessionId,
    deleteSession,
    renameSession,
  } = useChat()
  const { profile, isLoading, updateProfile } = useProfile()
  const { apiKey, setApiKey } = useSettings()
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(profile?.name || '')
  const [editApiKey, setEditApiKey] = useState(apiKey || '')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (profile?.name) setEditName(profile.name)
    if (apiKey) setEditApiKey(apiKey)
  }, [profile?.name, apiKey])

  const handleSave = async () => {
    try {
      if (!editName.trim()) {
        setError('Name is required')
        return
      }

      if (!editApiKey.trim() || !editApiKey.startsWith('sk-')) {
        setError('Valid API key is required')
        return
      }

      await updateProfile({ name: editName.trim() })
      setApiKey(editApiKey.trim())
      setIsEditing(false)
      setError(null)
    } catch (err) {
      console.error('Error updating profile:', err)
      setError('Failed to update profile')
    }
  }

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="p-2">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => setActiveSessionId(null)}
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="flex-1">
          <SidebarGroupContent className="h-full">
            <ScrollArea className="flex-1 px-2 py-4">
              {sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 p-4 text-center text-sm text-muted-foreground">
                  <MessageSquare className="h-8 w-8" />
                  <p>No conversations yet</p>
                  <p>Start a new chat to begin</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {sessions.map((session) => (
                    <ConversationItem
                      key={session.id}
                      session={session}
                      isActive={session.id === activeSessionId}
                      onSelect={() => setActiveSessionId(session.id!)}
                      onDelete={() => deleteSession(session.id!)}
                      onRename={(title) => renameSession(session.id!, title)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {isLoading ? (
          <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-lg">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        ) : (
          <div className="space-y-2">
            {isEditing ? (
              <div className="bg-muted/50 p-2 rounded-lg space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editName}
                    onChange={(e) => {
                      setEditName(e.target.value)
                      setError(null)
                    }}
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    value={editApiKey}
                    onChange={(e) => {
                      setEditApiKey(e.target.value)
                      setError(null)
                    }}
                    type="password"
                    placeholder="sk-..."
                  />
                </div>
                {error && <p className="text-xs text-destructive">{error}</p>}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setIsEditing(false)
                      setError(null)
                      setEditName(profile?.name || '')
                      setEditApiKey(apiKey || '')
                    }}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" className="flex-1" onClick={handleSave}>
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-lg">
                <Avatar>
                  <AvatarImage src={profile?.avatar} />
                  <AvatarFallback className="bg-primary/10">
                    {profile?.name?.[0]?.toUpperCase() || (
                      <User className="h-4 w-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-sm font-medium">
                  {profile?.name || 'User'}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsEditing(true)}
                >
                  <Settings className="h-4 w-4" />
                  <span className="sr-only">Edit Profile</span>
                </Button>
              </div>
            )}
          </div>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

function ConversationItem({
  session,
  isActive,
  onSelect,
  onDelete,
  onRename,
}: {
  session: ChatSession
  isActive: boolean
  onSelect: () => void
  onDelete: () => void
  onRename: (title: string) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(session.title)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleRename = () => {
    const newTitle = editedTitle.trim()
    if (newTitle && newTitle !== session.title) {
      console.log('Renaming session:', session.id, 'to:', newTitle)
      onRename(newTitle)
    } else {
      setEditedTitle(session.title)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename()
    } else if (e.key === 'Escape') {
      setEditedTitle(session.title)
      setIsEditing(false)
    }
  }

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  return (
    <div
      role="button"
      onClick={isEditing ? undefined : onSelect}
      className={cn(
        'group relative flex flex-col gap-1 rounded-lg p-3 text-sm transition-colors hover:bg-accent/50',
        isActive && 'bg-accent/50',
        isEditing ? 'cursor-default' : 'cursor-pointer',
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
          {isEditing ? (
            <Input
              ref={inputRef}
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleRename}
              onKeyDown={handleKeyDown}
              className="h-6 px-1"
            />
          ) : (
            <span className="font-medium line-clamp-1">{session.title}</span>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault()
                setIsEditing(true)
              }}
            >
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onSelect={(e) => {
                e.preventDefault()
                onDelete()
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <p className="line-clamp-1 flex-1">{session.lastMessage}</p>
        <time
          className="ml-2 shrink-0"
          dateTime={session.createdAt.toISOString()}
        >
          {new Date(session.createdAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          })}
        </time>
      </div>
    </div>
  )
}
