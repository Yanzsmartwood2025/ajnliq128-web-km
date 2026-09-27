import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.slice('Bearer '.length);
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Supabase Third-Party Auth expects Firebase JWTs to carry role=authenticated.
    // Persist it on the real Firebase user so a forced token refresh receives it.
    const userRecord = await adminAuth.getUser(uid);
    const currentClaims = userRecord.customClaims || {};

    if (currentClaims.role !== 'authenticated') {
      await adminAuth.setCustomUserClaims(uid, {
        ...currentClaims,
        role: 'authenticated',
      });
    }

    return NextResponse.json({ ok: true, uid });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error preparing Firebase/Supabase session:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: message },
      { status: 500 }
    );
  }
}
