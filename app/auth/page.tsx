'use client'

import { useState } from 'react'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { collection, getDocs, limit, query } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

async function redirectAfterAuth(uid: string) {
  const snap = await getDocs(query(collection(db, 'users', uid, 'identities'), limit(1)))
  window.location.href = snap.empty ? '/onboarding' : '/'
}

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      let uid: string
      if (isSignUp) {
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        uid = cred.user.uid
      } else {
        const cred = await signInWithEmailAndPassword(auth, email, password)
        uid = cred.user.uid
      }
      await redirectAfterAuth(uid)
    } catch (err: unknown) {
      const error = err as { message?: string }
      setMessage(error.message ?? 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    try {
      const cred = await signInWithPopup(auth, new GoogleAuthProvider())
      await redirectAfterAuth(cred.user.uid)
    } catch (err: unknown) {
      const error = err as { message?: string }
      setMessage(error.message ?? 'Google sign-in failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-sm border-border/50">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl font-bold tracking-tight">Better</CardTitle>
          <CardDescription>
            {isSignUp ? 'Create your account' : 'Sign in to continue'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogle}
            type="button"
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>

          <div className="flex items-center gap-2">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            {message && (
              <p className="text-sm text-muted-foreground">{message}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Loading…' : isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
