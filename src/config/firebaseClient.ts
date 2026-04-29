import firebaseClient from "firebase/compat/app"
import "firebase/compat/auth"
import "firebase/compat/database"

const CLIENT_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

if (typeof window !== "undefined" && !firebaseClient.apps.length) {
  console.log("[Firebase] initializing with projectId:", CLIENT_CONFIG.projectId)
  firebaseClient.initializeApp(CLIENT_CONFIG)
  firebaseClient
    .auth()
    .setPersistence(firebaseClient.auth.Auth.Persistence.SESSION)
  ;(window as any).firebase = firebaseClient
}

export { firebaseClient as default }
