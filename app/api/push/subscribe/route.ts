import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'

async function getUid(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) return null
  try {
    const decoded = await adminAuth.verifyIdToken(auth.slice(7))
    return decoded.uid
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  const uid = await getUid(req)
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { subscription, reminderTime } = await req.json()
  if (!subscription) return NextResponse.json({ error: 'Missing subscription' }, { status: 400 })

  await adminDb.doc(`users/${uid}/push_subscription/default`).set({
    subscription,
    reminder_time: reminderTime ?? '08:00',
    updated_at: new Date().toISOString(),
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const uid = await getUid(req)
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await adminDb.doc(`users/${uid}/push_subscription/default`).delete()
  return NextResponse.json({ ok: true })
}
