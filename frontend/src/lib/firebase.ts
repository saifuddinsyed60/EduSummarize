import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAZpxzfOaO0lUJxkCKMIU-9N5g2_tJPDBc",
  authDomain: "edusummarize.firebaseapp.com",
  projectId: "edusummarize"
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Export commonly used services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export default app;
