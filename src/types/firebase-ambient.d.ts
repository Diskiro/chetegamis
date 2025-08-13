declare module 'firebase/app' {
  export function initializeApp(config: unknown): unknown;
}

declare module 'firebase/firestore' {
  export function getFirestore(app?: unknown): unknown;
} 