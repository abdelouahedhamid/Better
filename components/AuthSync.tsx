'use client'

import { useEffect } from 'react'
import { onIdTokenChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase/client'

export function AuthSync() {
  useEffect(() => {
    const unsub = onIdTokenChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken()
        document.cookie = `__session=${token}; path=/; max-age=604800; SameSite=Lax`
      } else {
        document.cookie = '__session=; path=/; max-age=0'
      }
    })
    return unsub
  }, [])

  return null
}
