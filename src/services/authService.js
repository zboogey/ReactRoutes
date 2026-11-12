import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth, googleProvider } from '../firebase'

export const signup = (email, password) => createUserWithEmailAndPassword(auth, email, password)
export const login = (email, password) => signInWithEmailAndPassword(auth, email, password)
export const loginWithGoogle = () => signInWithPopup(auth, googleProvider)
export const logout = () => signOut(auth)
export const subscribe = (callback) => onAuthStateChanged(auth, callback)

const messages = {
  'auth/invalid-credential': 'Wrong email or password.',
  'auth/invalid-email': 'Invalid email address.',
  'auth/email-already-in-use': 'This email is already registered.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
  'auth/too-many-requests': 'Too many attempts. Try again later.',
}

export const authErrorMessage = (err) => messages[err?.code] || err?.message || 'Something went wrong.'
