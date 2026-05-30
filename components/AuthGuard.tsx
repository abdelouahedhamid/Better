'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase/client'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (!user && pathname !== '/auth') {
        router.replace('/auth')
      } else {
        setReady(true)
      }
    })
  }, [pathname, router])

  if (!ready) return null
  return <>{children}</>
}
