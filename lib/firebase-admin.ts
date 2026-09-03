import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import * as crypto from 'crypto';

if (!getApps().length) {
  try {
    // Only initialize if we actually have the required env vars
    // In nextjs build time these might be missing, so we use dummy values to satisfy the initialization
    const projectId = process.env.FIREBASE_PROJECT_ID || 'dummy-project-id';
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || 'dummy@example.com';
    let privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/gm, '\n')
      : '';

    if (!privateKey) {
      // Generate a dummy key pair for build time if not provided
      const { privateKey: genPrivateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem'
        }
      });
      privateKey = genPrivateKey;
    }

    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } catch (error: any) {
    console.error('Firebase Admin Initialization Error:', error.stack);
  }
}

export const adminAuth = getAuth();
