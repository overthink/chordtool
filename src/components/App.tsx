'use client'

import { useState } from 'react'
import { ProfileSelector } from './ProfileSelector'
import { TrainingSession } from './TrainingSession'

interface Profile {
  userId: number
  username: string
}

export function App() {
  const [profile, setProfile] = useState<Profile | null>(null)

  if (!profile) {
    return <ProfileSelector onProfileSelected={(userId, username) => setProfile({ userId, username })} />
  }

  return <TrainingSession userId={profile.userId} username={profile.username} />
}
