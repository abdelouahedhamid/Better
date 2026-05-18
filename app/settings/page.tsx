'use client'

import { useState, useEffect } from 'react'
import { signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)))
}

export default function SettingsPage() {
  const [email, setEmail] = useState('')
  const [notifEnabled, setNotifEnabled] = useState(false)
  const [reminderTime, setReminderTime] = useState('08:00')
  const [notifStatus, setNotifStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [notifMsg, setNotifMsg] = useState('')

  useEffect(() => {
    const user = auth.currentUser
    if (!user) return
    setEmail(user.email ?? '')
    getDoc(doc(db, 'users', user.uid, 'push_subscription', 'default')).then(snap => {
      if (snap.exists()) {
        setNotifEnabled(true)
        setReminderTime(snap.data().reminder_time ?? '08:00')
      }
    })
  }, [])

  async function authHeader(): Promise<Record<string, string>> {
    const user = auth.currentUser
    if (!user) return {}
    const token = await user.getIdToken()
    return { Authorization: `Bearer ${token}` }
  }

  async function handleToggleNotifications(enabled: boolean) {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setNotifMsg('Push notifications not supported in this browser.')
      return
    }

    setNotifStatus('loading')

    if (!enabled) {
      await fetch('/api/push/subscribe', { method: 'DELETE', headers: await authHeader() })
      setNotifEnabled(false)
      setNotifStatus('done')
      setNotifMsg('Notifications disabled.')
      return
    }

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      setNotifMsg('Permission denied. Enable notifications in browser settings.')
      setNotifStatus('error')
      return
    }

    try {
      const reg = await navigator.serviceWorker.ready
      const existing = await reg.pushManager.getSubscription()
      if (existing) await existing.unsubscribe()

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!) as unknown as BufferSource,
      })

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...await authHeader() },
        body: JSON.stringify({ subscription: sub.toJSON(), reminderTime }),
      })

      if (res.ok) {
        setNotifEnabled(true)
        setNotifStatus('done')
        setNotifMsg('Notifications enabled!')
      } else {
        throw new Error('Server error')
      }
    } catch {
      setNotifMsg('Failed to enable notifications.')
      setNotifStatus('error')
    }
  }

  async function handleUpdateTime() {
    if (!notifEnabled) return
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...await authHeader() },
      body: JSON.stringify({ reminderTime }),
    })
    setNotifMsg('Reminder time updated.')
  }

  async function handleSignOut() {
    await signOut(auth)
    window.location.href = '/auth'
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>

      <section className="space-y-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account</p>
        <div className="rounded-xl border border-border/40 bg-card p-4 space-y-3">
          <div>
            <p className="text-xs text-muted-foreground">Signed in as</p>
            <p className="text-sm font-medium mt-0.5">{email || '—'}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut} className="text-destructive border-destructive/30 hover:bg-destructive/10">
            Sign out
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notifications</p>
        <div className="rounded-xl border border-border/40 bg-card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Daily habit reminder</p>
              <p className="text-xs text-muted-foreground mt-0.5">Browser push notification</p>
            </div>
            <Switch
              checked={notifEnabled}
              onCheckedChange={handleToggleNotifications}
              disabled={notifStatus === 'loading'}
            />
          </div>

          {notifEnabled && (
            <div className="space-y-1.5 border-t border-border/30 pt-4">
              <Label htmlFor="reminder-time">Reminder time</Label>
              <div className="flex gap-2">
                <Input
                  id="reminder-time"
                  type="time"
                  value={reminderTime}
                  onChange={e => setReminderTime(e.target.value)}
                  className="w-36"
                />
                <Button size="sm" variant="outline" onClick={handleUpdateTime}>Save</Button>
              </div>
            </div>
          )}

          {notifMsg && (
            <p className={`text-xs ${notifStatus === 'error' ? 'text-destructive' : 'text-muted-foreground'}`}>
              {notifMsg}
            </p>
          )}
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">About</p>
        <div className="rounded-xl border border-border/40 bg-card p-4">
          <p className="text-sm font-medium">Better</p>
          <p className="text-xs text-muted-foreground mt-0.5">Build good habits. Reduce bad ones. Get things done.</p>
        </div>
      </section>
    </div>
  )
}
