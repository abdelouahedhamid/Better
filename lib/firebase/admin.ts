import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

function initAdmin() {
  if (getApps().length > 0) return getApps()[0]
  // On Firebase App Hosting / Cloud Run: ADC used automatically (no key needed)
  // Local dev with explicit key: set FIREBASE_PRIVATE_KEY in .env.local
  if (process.env.FIREBASE_PRIVATE_KEY) {
    return initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    })
  }
  return initializeApp()
}

initAdmin()
export const adminAuth = getAuth()
export const adminDb = getFirestore()
