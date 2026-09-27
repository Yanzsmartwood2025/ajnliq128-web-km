import { randomInt } from 'crypto';
import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { supabaseAdminRest } from '@/lib/supabase-admin';

const LUMENFALL_ORIGIN = (
  process.env.NEXT_PUBLIC_LUMENFALL_URL || 'https://lumen-fall-official.vercel.app/'
).replace(/\/$/, '');

function corsHeaders(request: Request) {
  const origin = request.headers.get('origin') || '';
  const allowOrigin = origin === LUMENFALL_ORIGIN ? origin : LUMENFALL_ORIGIN;
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'POST, PATCH, OPTIONS',
    Vary: 'Origin',
  };
}

function json(request: Request, body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: corsHeaders(request) });
}

async function authenticate(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) throw new Error('UNAUTHORIZED');
  const token = authHeader.slice('Bearer '.length);
  return adminAuth.verifyIdToken(token);
}

function enc(value: string) {
  return encodeURIComponent(value);
}

async function getProfile(uid: string) {
  const rows = await supabaseAdminRest<any[]>(
    `lumenfall_perfiles?select=*&user_id=eq.${enc(uid)}&limit=1`,
  );
  return rows[0] || null;
}

async function generateGameCode() {
  for (let i = 0; i < 20; i++) {
    const code = String(randomInt(100000, 1000000));
    const rows = await supabaseAdminRest<any[]>(
      `lumenfall_perfiles?select=user_id&game_code=eq.${code}&limit=1`,
    );
    if (rows.length === 0) return code;
  }
  throw new Error('No se pudo generar un código de juego único.');
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
}

export async function POST(request: Request) {
  try {
    const decoded = await authenticate(request);
    const uid = decoded.uid;
    let profile = await getProfile(uid);

    const now = new Date().toISOString();
    const displayName =
      typeof decoded.name === 'string' && decoded.name
        ? decoded.name
        : typeof decoded.email === 'string'
          ? decoded.email.split('@')[0]
          : `Operador-${uid.slice(0, 6)}`;

    if (!profile) {
      const rows = await supabaseAdminRest<any[]>('lumenfall_perfiles?select=*', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify([{
          user_id: uid,
          email: typeof decoded.email === 'string' ? decoded.email : null,
          display_name: displayName,
          photo_url: typeof decoded.picture === 'string' ? decoded.picture : null,
          game_code: await generateGameCode(),
          last_login: now,
          updated_at: now,
        }]),
      });
      profile = rows[0] || null;
    } else {
      const rows = await supabaseAdminRest<any[]>(
        `lumenfall_perfiles?user_id=eq.${enc(uid)}&select=*`,
        {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify({
            email: typeof decoded.email === 'string' ? decoded.email : profile.email,
            display_name: displayName,
            photo_url: typeof decoded.picture === 'string' ? decoded.picture : profile.photo_url,
            last_login: now,
            updated_at: now,
          }),
        },
      );
      profile = rows[0] || profile;
    }

    return json(request, {
      ok: true,
      user: {
        uid,
        email: typeof decoded.email === 'string' ? decoded.email : null,
        displayName,
        photoURL: typeof decoded.picture === 'string' ? decoded.picture : null,
      },
      profile: {
        gameCode: profile?.game_code || null,
        progress: profile?.progress || {},
        settings: profile?.settings || {},
      },
      storage: {
        provider: 'cloudflare-r2',
        baseUrl: process.env.NEXT_PUBLIC_R2_BASE_URL || null,
        namespace: `joziel/lumenfall/users/${uid}`,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message === 'UNAUTHORIZED') return json(request, { error: 'Unauthorized' }, 401);
    console.error('[AJN Lumenfall session]', error);
    return json(request, { error: 'Lumenfall central session failed', details: message }, 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const decoded = await authenticate(request);
    const uid = decoded.uid;
    const body = await request.json();
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (body?.progress && typeof body.progress === 'object') patch.progress = body.progress;
    if (body?.settings && typeof body.settings === 'object') patch.settings = body.settings;

    const rows = await supabaseAdminRest<any[]>(
      `lumenfall_perfiles?user_id=eq.${enc(uid)}&select=*`,
      {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(patch),
      },
    );

    return json(request, { ok: true, profile: rows[0] || null });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message === 'UNAUTHORIZED') return json(request, { error: 'Unauthorized' }, 401);
    console.error('[AJN Lumenfall progress]', error);
    return json(request, { error: 'Lumenfall progress save failed', details: message }, 500);
  }
}
