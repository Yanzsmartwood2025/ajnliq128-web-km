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
        `aria_conversaciones?select=id,titulo,updated_at&user_id=eq.${enc(uid)}&order=updated_at.desc`
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
        `aria_mensajes?select=rol,contenido,engine,metadata&conversacion_id=eq.${enc(conversationId)}&order=fecha.asc`
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

      const clientMessageId = body?.clientMessageId
        ? String(body.clientMessageId).slice(0, 120)
        : null;

      const rows = await supabaseAdminRest<any[]>(
        clientMessageId
          ? 'aria_mensajes?on_conflict=client_message_id&select=*'
          : 'aria_mensajes?select=*',
        {
          method: 'POST',
          headers: {
            Prefer: clientMessageId
              ? 'resolution=merge-duplicates,return=representation'
              : 'return=representation',
          },
          body: JSON.stringify([{
            conversacion_id: conversationId,
            rol: role,
            contenido: String(body?.content || ''),
            engine: body?.engine ? String(body.engine) : null,
            client_message_id: clientMessageId,
            metadata: body?.metadata && typeof body.metadata === 'object' ? body.metadata : {},
          }]),
        }
      );

      await supabaseAdminRest(
        `aria_conversaciones?id=eq.${enc(conversationId)}&user_id=eq.${enc(uid)}`,
        {
          method: 'PATCH',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({ updated_at: new Date().toISOString() }),
        }
      );

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

    if (action === 'list_memory') {
      const data = await supabaseAdminRest<any[]>(
        `aria_memory_items?select=id,scope,project_key,conversation_id,kind,content,importance,confidence,metadata,created_at,updated_at,last_used_at&user_id=eq.${enc(uid)}&order=updated_at.desc&limit=120`
      );
      return json(request, { data });
    }

    if (action === 'save_memory') {
      const content = String(body?.content || '').trim().slice(0, 2400);
      if (!content) return json(request, { error: 'Memory content is required' }, 400);

      const rawEmbedding = Array.isArray(body?.embedding) ? body.embedding : [];
      if (rawEmbedding.length !== 1024 || rawEmbedding.some((value: unknown) => !Number.isFinite(Number(value)))) {
        return json(request, { error: 'Invalid memory embedding' }, 400);
      }

      const scope = ['global', 'chat', 'project'].includes(String(body?.scope))
        ? String(body.scope)
        : 'global';
      const kind = ['fact', 'preference', 'decision', 'project', 'relationship', 'instruction', 'other'].includes(String(body?.kind))
        ? String(body.kind)
        : 'fact';
      const importance = Math.min(5, Math.max(1, Number(body?.importance || 3)));
      const confidence = Math.min(1, Math.max(0, Number(body?.confidence ?? 1)));
      const conversationId = body?.conversationId ? String(body.conversationId) : null;

      if (conversationId && !(await ownsConversation(uid, conversationId))) {
        return json(request, { error: 'Conversation not found' }, 404);
      }

      const vector = `[${rawEmbedding.map((value: unknown) => Number(value)).join(',')}]`;
      const rows = await supabaseAdminRest<any[]>('aria_memory_items?select=*', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify([{
          user_id: uid,
          scope,
          project_key: body?.projectKey ? String(body.projectKey).slice(0, 160) : null,
          conversation_id: conversationId,
          kind,
          content,
          importance,
          confidence,
          embedding: vector,
          source: body?.source ? String(body.source).slice(0, 80) : 'assistant',
          metadata: body?.metadata && typeof body.metadata === 'object' ? body.metadata : {},
        }]),
      });

      return json(request, { data: rows[0] || null });
    }

    if (action === 'search_memory') {
      const rawEmbedding = Array.isArray(body?.embedding) ? body.embedding : [];
      if (rawEmbedding.length !== 1024 || rawEmbedding.some((value: unknown) => !Number.isFinite(Number(value)))) {
        return json(request, { error: 'Invalid memory embedding' }, 400);
      }

      const vector = `[${rawEmbedding.map((value: unknown) => Number(value)).join(',')}]`;
      const data = await supabaseAdminRest<any[]>('rpc/match_aria_memories', {
        method: 'POST',
        body: JSON.stringify({
          p_user_id: uid,
          p_query_embedding: vector,
          p_match_count: Math.min(12, Math.max(1, Number(body?.limit || 8))),
        }),
      });

      const ids = data.map((item) => item.id).filter(Boolean);
      if (ids.length) {
        await supabaseAdminRest(
          `aria_memory_items?id=in.(${ids.join(',')})&user_id=eq.${enc(uid)}`,
          {
            method: 'PATCH',
            headers: { Prefer: 'return=minimal' },
            body: JSON.stringify({ last_used_at: new Date().toISOString() }),
          }
        ).catch(() => undefined);
      }

      return json(request, { data });
    }

    if (action === 'delete_memory') {
      const memoryId = String(body?.memoryId || '');
      if (!memoryId) return json(request, { error: 'Memory id is required' }, 400);

      await supabaseAdminRest(
        `aria_memory_items?id=eq.${enc(memoryId)}&user_id=eq.${enc(uid)}`,
        { method: 'DELETE' }
      );
      return json(request, { ok: true });
    }

    if (action === 'search_history') {
      const query = String(body?.query || '').trim().toLowerCase();
      if (!query) return json(request, { data: [] });

      const conversations = await supabaseAdminRest<any[]>(
        `aria_conversaciones?select=id,titulo&user_id=eq.${enc(uid)}&order=updated_at.desc&limit=50`
      );
      const ids = conversations.map((item) => item.id).filter(Boolean);
      if (!ids.length) return json(request, { data: [] });

      const messages = await supabaseAdminRest<any[]>(
        `aria_mensajes?select=conversacion_id,rol,contenido,engine,fecha&conversacion_id=in.(${ids.join(',')})&order=fecha.desc&limit=500`
      );

      const titleById = new Map(conversations.map((item) => [item.id, item.titulo]));
      const normalizedTerms = query
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .split(/\s+/)
        .map((term) => term.trim())
        .filter((term) => term.length >= 3)
        .slice(0, 12);

      const data = messages
        .map((message) => {
          const haystack = String(message.contenido || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
          const score = normalizedTerms.reduce(
            (total, term) => total + (haystack.includes(term) ? 1 : 0),
            0
          );
          return {
            ...message,
            titulo: titleById.get(message.conversacion_id) || 'Conversación',
            score,
          };
        })
        .filter((message) => message.score > 0)
        .sort((a, b) => b.score - a.score || String(b.fecha).localeCompare(String(a.fecha)))
        .slice(0, Math.min(12, Math.max(1, Number(body?.limit || 8))));

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
