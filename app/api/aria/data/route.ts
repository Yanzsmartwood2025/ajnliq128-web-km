import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { supabaseAdminRest } from '@/lib/supabase-admin';

const ARIA_ORIGIN = (
  process.env.NEXT_PUBLIC_ARIA_LLM_URL || 'https://aria-llm.vercel.app'
).replace(/\/$/, '');

function corsHeaders(request: Request) {
  const origin = request.headers.get('origin') || '';
  const allowOrigin = origin === ARIA_ORIGIN ? origin : ARIA_ORIGIN;
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
}

function json(request: Request, body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: corsHeaders(request) });
}

async function authenticate(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('UNAUTHORIZED');
  }
  const token = authHeader.slice('Bearer '.length);
  const decoded = await adminAuth.verifyIdToken(token);
  return decoded.uid;
}

function enc(value: string) {
  return encodeURIComponent(value);
}

async function ownsConversation(uid: string, conversationId: string) {
  const rows = await supabaseAdminRest<Array<{ id: string }>>(
    `aria_conversaciones?select=id&id=eq.${enc(conversationId)}&user_id=eq.${enc(uid)}&limit=1`
  );
  return rows.length > 0;
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
}

export async function POST(request: Request) {
  try {
    const uid = await authenticate(request);
    const body = await request.json();
    const action = String(body?.action || '');

    if (action === 'list_conversations') {
      const data = await supabaseAdminRest(
        `aria_conversaciones?select=id,titulo&user_id=eq.${enc(uid)}&order=fecha_creacion.desc`
      );
      return json(request, { data });
    }

    if (action === 'get_profile') {
      const rows = await supabaseAdminRest<unknown[]>(
        `aria_perfil_usuario?select=*&user_id=eq.${enc(uid)}&limit=1`
      );
      return json(request, { data: rows[0] || null });
    }

    if (action === 'create_conversation') {
      const title = String(body?.title || 'Nueva conversación').trim().slice(0, 160);
      const rows = await supabaseAdminRest<any[]>('aria_conversaciones?select=*', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify([{ user_id: uid, titulo: title || 'Nueva conversación' }]),
      });
      return json(request, { data: rows[0] || null });
    }

    if (action === 'list_messages') {
      const conversationId = String(body?.conversationId || '');
      if (!conversationId || !(await ownsConversation(uid, conversationId))) {
        return json(request, { error: 'Conversation not found' }, 404);
      }
      const data = await supabaseAdminRest(
        `aria_mensajes?select=rol,contenido,engine&conversacion_id=eq.${enc(conversationId)}&order=fecha.asc`
      );
      return json(request, { data });
    }

    if (action === 'save_message') {
      const conversationId = String(body?.conversationId || '');
      if (!conversationId || !(await ownsConversation(uid, conversationId))) {
        return json(request, { error: 'Conversation not found' }, 404);
      }

      const role = String(body?.role || '');
      if (!['user', 'assistant', 'system', 'tool'].includes(role)) {
        return json(request, { error: 'Invalid role' }, 400);
      }

      const rows = await supabaseAdminRest<any[]>('aria_mensajes?select=*', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify([{
          conversacion_id: conversationId,
          rol: role,
          contenido: String(body?.content || ''),
          engine: body?.engine ? String(body.engine) : null,
          metadata: body?.metadata && typeof body.metadata === 'object' ? body.metadata : {},
        }]),
      });
      return json(request, { data: rows[0] || null });
    }

    if (action === 'rename_conversation') {
      const conversationId = String(body?.conversationId || '');
      const title = String(body?.title || '').trim().slice(0, 160);
      if (!conversationId || !title || !(await ownsConversation(uid, conversationId))) {
        return json(request, { error: 'Conversation not found or invalid title' }, 400);
      }
      const data = await supabaseAdminRest(
        `aria_conversaciones?id=eq.${enc(conversationId)}&user_id=eq.${enc(uid)}&select=*`,
        {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify({ titulo: title, updated_at: new Date().toISOString() }),
        }
      );
      return json(request, { data });
    }

    if (action === 'delete_conversation') {
      const conversationId = String(body?.conversationId || '');
      if (!conversationId || !(await ownsConversation(uid, conversationId))) {
        return json(request, { error: 'Conversation not found' }, 404);
      }
      await supabaseAdminRest(
        `aria_conversaciones?id=eq.${enc(conversationId)}&user_id=eq.${enc(uid)}`,
        { method: 'DELETE' }
      );
      return json(request, { ok: true });
    }

    if (action === 'delete_profile') {
      await supabaseAdminRest(`aria_perfil_usuario?user_id=eq.${enc(uid)}`, {
        method: 'DELETE',
      });
      return json(request, { ok: true });
    }

    if (action === 'update_profile') {
      const allowed = [
        'nombre_preferido',
        'comida_favorita',
        'musica_favorita',
        'ultimo_estado_animo',
        'nota_contextual',
        'temas_interes',
        'preferencias',
      ];
      const patch: Record<string, unknown> = {
        user_id: uid,
        updated_at: new Date().toISOString(),
      };
      for (const key of allowed) {
        if (body?.profile && Object.prototype.hasOwnProperty.call(body.profile, key)) {
          patch[key] = body.profile[key];
        }
      }

      const rows = await supabaseAdminRest<any[]>(
        'aria_perfil_usuario?on_conflict=user_id&select=*',
        {
          method: 'POST',
          headers: {
            Prefer: 'resolution=merge-duplicates,return=representation',
          },
          body: JSON.stringify([patch]),
        }
      );
      return json(request, { data: rows[0] || null });
    }

    if (action === 'search_knowledge') {
      const query = String(body?.query || '').trim().toLowerCase();
      const [globalRows, privateRows] = await Promise.all([
        supabaseAdminRest<any[]>(
          'conocimiento_aprendido?select=id,titulo,contenido,tags,metadata&namespace=eq.aria&visibility=eq.global&order=updated_at.desc&limit=80'
        ),
        supabaseAdminRest<any[]>(
          `conocimiento_aprendido?select=id,titulo,contenido,tags,metadata&namespace=eq.aria&visibility=eq.private&owner_user_id=eq.${enc(uid)}&order=updated_at.desc&limit=80`
        ),
      ]);

      const all = [...globalRows, ...privateRows];
      const data = query
        ? all.filter((item) =>
            [item.titulo, item.contenido, ...(Array.isArray(item.tags) ? item.tags : [])]
              .filter(Boolean)
              .join(' ')
              .toLowerCase()
              .includes(query)
          ).slice(0, 20)
        : all.slice(0, 20);

      return json(request, { data });
    }

    return json(request, { error: 'Unsupported action' }, 400);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message === 'UNAUTHORIZED') return json(request, { error: 'Unauthorized' }, 401);
    console.error('[AJN arIA data]', error);
    return json(request, { error: 'Central data service failed', details: message }, 500);
  }
}
