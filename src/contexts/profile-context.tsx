import { createContext, useContext, useEffect, useState } from 'react'
import { db, type Profile } from '@/lib/db'
import { useLiveQuery } from 'dexie-react-hooks'

interface ProfileContextType {
  profile: Profile | null
  isLoading: boolean
  updateProfile: (updates: Partial<Profile>) => Promise<void>
}

const ProfileContext = createContext<ProfileContextType | null>(null)

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const profile = useLiveQuery(async () => {
    const profiles = await db.profiles.toArray()
    return profiles[0] || null
  })

  const isLoading = profile === undefined

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile?.id) return

    await db.profiles.update(profile.id, {
      ...updates,
      updatedAt: new Date(),
    })
  }

  return (
    <ProfileContext.Provider
      value={{
        profile: profile || null,
        isLoading,
        updateProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}
