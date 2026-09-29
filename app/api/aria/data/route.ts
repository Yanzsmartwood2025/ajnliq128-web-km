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

function clampChessNumber(value: unknown, min: number, max: number, fallback: number) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(max, Math.max(min, numeric));
}

async function chessDisplayName(uid: string) {
  const rows = await supabaseAdminRest<Array<{ nombre_preferido?: string | null }>>(
    `aria_perfil_usuario?select=nombre_preferido&user_id=eq.${enc(uid)}&limit=1`
  );
  const raw = String(rows[0]?.nombre_preferido || '').trim().replace(/\s+/g, ' ');
  return raw ? raw.slice(0, 40) : 'Jugador';
}

async function ensureChessProfile(uid: string) {
  const existing = await supabaseAdminRest<any[]>(
    `aria_chess_profiles?select=*&user_id=eq.${enc(uid)}&limit=1`
  );
  if (existing[0]) return existing[0];

  const displayName = await chessDisplayName(uid);
  const rows = await supabaseAdminRest<any[]>(
    'aria_chess_profiles?on_conflict=user_id&select=*',
    {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify([{
        user_id: uid,
        display_name: displayName,
        rating: 800,
        skill_estimate: 2,
        aria_difficulty: 1.5,
        avg_move_quality: 0.5,
      }]),
    }
  );

  const defaults = await supabaseAdminRest<any[]>(
    'aria_game_gift_catalog?select=id&game_key=eq.chess&active=eq.true&acquisition_type=eq.default'
  );
  if (defaults.length) {
    await supabaseAdminRest(
      'aria_game_user_gifts?on_conflict=user_id,gift_id',
      {
        method: 'POST',
        headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' },
        body: JSON.stringify(defaults.map((gift) => ({
          user_id: uid,
          gift_id: gift.id,
          source: 'default',
        }))),
      }
    ).catch(() => undefined);
  }

  return rows[0] || {
    user_id: uid,
    display_name: displayName,
    rating: 800,
    skill_estimate: 2,
    aria_difficulty: 1.5,
    avg_move_quality: 0.5,
    games_played: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    current_streak: 0,
    best_win_streak: 0,
  };
}

async function chessGiftRows(uid: string) {
  const [catalog, owned] = await Promise.all([
    supabaseAdminRest<any[]>(
      'aria_game_gift_catalog?select=id,game_key,name_es,name_en,name_de,description_es,description_en,description_de,acquisition_type,unlock_wins,price_cents,currency,purchase_enabled,asset_type,asset_config,sort_order&game_key=eq.chess&active=eq.true&order=sort_order.asc'
    ),
    supabaseAdminRest<any[]>(
      `aria_game_user_gifts?select=gift_id,source,equipped,unlocked_at&user_id=eq.${enc(uid)}`
    ),
  ]);
  const ownership = new Map(owned.map((row) => [row.gift_id, row]));
  return catalog.map((gift) => ({
    ...gift,
    owned: ownership.has(gift.id),
    ownership: ownership.get(gift.id) || null,
  }));
}

async function unlockChessWinGifts(uid: string, wins: number) {
  const catalog = await supabaseAdminRest<any[]>(
    `aria_game_gift_catalog?select=id,name_es,name_en,name_de,unlock_wins,asset_type,asset_config&game_key=eq.chess&active=eq.true&acquisition_type=eq.unlock&unlock_wins=lte.${Math.max(0, wins)}&order=unlock_wins.asc`
  );
  if (!catalog.length) return [];

  const owned = await supabaseAdminRest<any[]>(
    `aria_game_user_gifts?select=gift_id&user_id=eq.${enc(uid)}`
  );
  const ownedSet = new Set(owned.map((row) => row.gift_id));
  const newRewards = catalog.filter((gift) => !ownedSet.has(gift.id));

  if (newRewards.length) {
    await supabaseAdminRest(
      'aria_game_user_gifts?on_conflict=user_id,gift_id',
      {
        method: 'POST',
        headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' },
        body: JSON.stringify(newRewards.map((gift) => ({
          user_id: uid,
          gift_id: gift.id,
          source: 'unlock',
        }))),
      }
    );
  }

  return newRewards;
}

async function ownsMusicPlaylist(uid: string, playlistId: string) {
  const rows = await supabaseAdminRest<Array<{ id: string }>>(
    `aria_music_playlists?select=id&id=eq.${enc(playlistId)}&user_id=eq.${enc(uid)}&limit=1`
  );
  return rows.length > 0;
}

async function musicLibraryState(uid: string) {
  const [playlists, favorites, requests] = await Promise.all([
    supabaseAdminRest<any[]>(
      `aria_music_playlists?select=id,name,description,is_default,created_at,updated_at&user_id=eq.${enc(uid)}&order=is_default.desc,updated_at.desc`
    ),
    supabaseAdminRest<any[]>(
      `aria_music_favorites?select=track_id,created_at&user_id=eq.${enc(uid)}&order=created_at.desc`
    ),
    supabaseAdminRest<any[]>(
      `aria_music_requests?select=id,artist,title,note,status,created_at,updated_at&user_id=eq.${enc(uid)}&order=created_at.desc&limit=30`
    ),
  ]);

  const playlistIds = playlists.map((playlist) => playlist.id).filter(Boolean);
  const items = playlistIds.length
    ? await supabaseAdminRest<any[]>(
        `aria_music_playlist_items?select=playlist_id,track_id,position,added_at&user_id=eq.${enc(uid)}&playlist_id=in.(${playlistIds.join(',')})&order=position.asc,added_at.asc`
      )
    : [];

  return {
    playlists: playlists.map((playlist) => ({
      ...playlist,
      items: items.filter((item) => item.playlist_id === playlist.id),
    })),
    favorites: favorites.map((row) => row.track_id),
    requests,
  };
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
        `aria_conversaciones?select=id,titulo,updated_at,metadata&user_id=eq.${enc(uid)}&order=updated_at.desc`
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
      const clientConversationId = body?.clientConversationId
        ? String(body.clientConversationId)
        : '';
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        clientConversationId
      );

      if (clientConversationId && !isUuid) {
        return json(request, { error: 'Invalid conversation id' }, 400);
      }

      if (isUuid) {
        const existing = await supabaseAdminRest<any[]>(
          `aria_conversaciones?select=*&id=eq.${enc(clientConversationId)}&user_id=eq.${enc(uid)}&limit=1`
        );
        if (existing[0]) return json(request, { data: existing[0], idempotent: true });
      }

      const rows = await supabaseAdminRest<any[]>('aria_conversaciones?select=*', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify([{
          ...(isUuid ? { id: clientConversationId } : {}),
          user_id: uid,
          titulo: title || 'Nueva conversación',
        }]),
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

    if (action === 'update_conversation_settings') {
      const conversationId = String(body?.conversationId || '');
      if (!conversationId || !(await ownsConversation(uid, conversationId))) {
        return json(request, { error: 'Conversation not found' }, 404);
      }

      const rows = await supabaseAdminRest<any[]>(
        `aria_conversaciones?select=metadata&id=eq.${enc(conversationId)}&user_id=eq.${enc(uid)}&limit=1`
      );
      const currentMetadata =
        rows[0]?.metadata && typeof rows[0].metadata === 'object'
          ? rows[0].metadata
          : {};
      const incoming =
        body?.settings && typeof body.settings === 'object'
          ? body.settings
          : {};

      const metadata = {
        ...currentMetadata,
        ...incoming,
      };

      const data = await supabaseAdminRest<any[]>(
        `aria_conversaciones?id=eq.${enc(conversationId)}&user_id=eq.${enc(uid)}&select=*`,
        {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify({
            metadata,
            updated_at: new Date().toISOString(),
          }),
        }
      );

      return json(request, { data: data[0] || null });
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
      await Promise.all([
        supabaseAdminRest(`aria_perfil_usuario?user_id=eq.${enc(uid)}`, {
          method: 'DELETE',
        }),
        supabaseAdminRest(`aria_memory_items?user_id=eq.${enc(uid)}`, {
          method: 'DELETE',
        }),
        supabaseAdminRest(`aria_game_sessions?user_id=eq.${enc(uid)}`, {
          method: 'DELETE',
        }),
        supabaseAdminRest(`aria_music_sessions?user_id=eq.${enc(uid)}`, {
          method: 'DELETE',
        }),
        supabaseAdminRest(`aria_game_user_gifts?user_id=eq.${enc(uid)}`, {
          method: 'DELETE',
        }),
        supabaseAdminRest(`aria_chess_matches?user_id=eq.${enc(uid)}`, {
          method: 'DELETE',
        }),
        supabaseAdminRest(`aria_chess_profiles?user_id=eq.${enc(uid)}`, {
          method: 'DELETE',
        }),
      ]);
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

    if (action === 'get_chess_profile') {
      const profile = await ensureChessProfile(uid);
      const latestName = await chessDisplayName(uid);
      if (latestName !== profile.display_name) {
        await supabaseAdminRest(
          `aria_chess_profiles?user_id=eq.${enc(uid)}`,
          {
            method: 'PATCH',
            headers: { Prefer: 'return=minimal' },
            body: JSON.stringify({ display_name: latestName, updated_at: new Date().toISOString() }),
          }
        );
        profile.display_name = latestName;
      }
      return json(request, { data: profile });
    }

    if (action === 'get_chess_leaderboard') {
      const [top, me] = await Promise.all([
        supabaseAdminRest<any[]>(
          'aria_chess_profiles?select=display_name,rating,skill_estimate,wins,losses,draws,games_played,best_win_streak&games_played=gt.0&order=rating.desc,wins.desc,games_played.asc&limit=10'
        ),
        ensureChessProfile(uid),
      ]);

      return json(request, {
        data: top.map((row, index) => ({
          rank: index + 1,
          displayName: row.display_name || 'Jugador',
          rating: Number(row.rating || 800),
          level: Number(row.skill_estimate || 2),
          wins: Number(row.wins || 0),
          losses: Number(row.losses || 0),
          draws: Number(row.draws || 0),
          gamesPlayed: Number(row.games_played || 0),
          bestWinStreak: Number(row.best_win_streak || 0),
        })),
        me: {
          displayName: me.display_name || 'Jugador',
          rating: Number(me.rating || 800),
          level: Number(me.skill_estimate || 2),
          difficulty: Number(me.aria_difficulty || 1.5),
          wins: Number(me.wins || 0),
          losses: Number(me.losses || 0),
          draws: Number(me.draws || 0),
          gamesPlayed: Number(me.games_played || 0),
          bestWinStreak: Number(me.best_win_streak || 0),
        },
      });
    }

    if (action === 'list_chess_gifts') {
      await ensureChessProfile(uid);
      return json(request, { data: await chessGiftRows(uid) });
    }

    if (action === 'record_chess_result') {
      const clientMatchId = String(body?.clientMatchId || '').trim().slice(0, 80);
      if (!/^[a-zA-Z0-9_-]{8,80}$/.test(clientMatchId)) {
        return json(request, { error: 'Invalid match id' }, 400);
      }

      const result = String(body?.result || '');
      if (!['win', 'loss', 'draw'].includes(result)) {
        return json(request, { error: 'Invalid result' }, 400);
      }

      const moveCount = Math.round(clampChessNumber(body?.moveCount, 2, 500, 2));
      const quality = clampChessNumber(body?.avgMoveQuality, 0, 1, 0.5);

      const duplicate = await supabaseAdminRest<any[]>(
        `aria_chess_matches?select=id&user_id=eq.${enc(uid)}&client_match_id=eq.${enc(clientMatchId)}&limit=1`
      );
      if (duplicate[0]) {
        const profile = await ensureChessProfile(uid);
        return json(request, {
          data: profile,
          rewards: await chessGiftRows(uid),
          idempotent: true,
        });
      }

      const profile = await ensureChessProfile(uid);
      const gamesBefore = Math.max(0, Number(profile.games_played || 0));
      const ratingBefore = Math.max(100, Number(profile.rating || 800));
      const skillBefore = clampChessNumber(profile.skill_estimate, 1, 10, 2);
      const difficultyBefore = clampChessNumber(profile.aria_difficulty, 1, 10, 1.5);
      const previousQuality = clampChessNumber(profile.avg_move_quality, 0, 1, 0.5);
      const previousStreak = Number(profile.current_streak || 0);

      const score = result === 'win' ? 1 : result === 'draw' ? 0.5 : 0;
      const ariaEquivalentRating = 550 + difficultyBefore * 110;
      const expected = 1 / (1 + Math.pow(10, (ariaEquivalentRating - ratingBefore) / 400));
      const k = gamesBefore < 10 ? 48 : 28;
      const ratingAfter = Math.round(
        clampChessNumber(ratingBefore + k * (score - expected), 100, 4000, ratingBefore)
      );

      const resultSkillAdjustment = result === 'win' ? 0.8 : result === 'loss' ? -0.35 : 0.15;
      const targetSkill = clampChessNumber(1 + quality * 8.2 + resultSkillAdjustment, 1, 10, skillBefore);
      const learningRate = gamesBefore < 3 ? 0.50 : gamesBefore < 10 ? 0.32 : 0.18;
      const skillAfter = Number(
        clampChessNumber(
          skillBefore * (1 - learningRate) + targetSkill * learningRate,
          1,
          10,
          skillBefore
        ).toFixed(2)
      );

      let currentStreak = 0;
      if (result === 'win') currentStreak = previousStreak >= 0 ? previousStreak + 1 : 1;
      if (result === 'loss') currentStreak = previousStreak <= 0 ? previousStreak - 1 : -1;

      const difficultyOffset = gamesBefore < 3 ? -0.8 : -0.25;
      const streakAdjustment = currentStreak >= 3 ? 0.45 : currentStreak <= -2 ? -0.55 : 0;
      const desiredDifficulty = clampChessNumber(
        skillAfter + difficultyOffset + streakAdjustment,
        1,
        10,
        skillAfter
      );
      const difficultyAfter = Number(
        clampChessNumber(
          difficultyBefore * 0.55 + desiredDifficulty * 0.45,
          1,
          10,
          difficultyBefore
        ).toFixed(2)
      );

      const gamesAfter = gamesBefore + 1;
      const winsAfter = Number(profile.wins || 0) + (result === 'win' ? 1 : 0);
      const lossesAfter = Number(profile.losses || 0) + (result === 'loss' ? 1 : 0);
      const drawsAfter = Number(profile.draws || 0) + (result === 'draw' ? 1 : 0);
      const bestWinStreak = Math.max(Number(profile.best_win_streak || 0), Math.max(0, currentStreak));
      const avgMoveQuality = Number(
        (((previousQuality * gamesBefore) + quality) / gamesAfter).toFixed(4)
      );

      const displayName = await chessDisplayName(uid);

      const inserted = await supabaseAdminRest<any[]>(
        'aria_chess_matches?on_conflict=user_id,client_match_id&select=id',
        {
          method: 'POST',
          headers: { Prefer: 'resolution=ignore-duplicates,return=representation' },
          body: JSON.stringify([{
            user_id: uid,
            client_match_id: clientMatchId,
            result,
            move_count: moveCount,
            avg_move_quality: quality,
            difficulty_before: difficultyBefore,
            difficulty_after: difficultyAfter,
            skill_before: skillBefore,
            skill_after: skillAfter,
            rating_before: ratingBefore,
            rating_after: ratingAfter,
            metadata: { version: 1 },
          }]),
        }
      );

      if (!inserted[0]) {
        const current = await ensureChessProfile(uid);
        return json(request, {
          data: current,
          rewards: await chessGiftRows(uid),
          idempotent: true,
        });
      }

      const rows = await supabaseAdminRest<any[]>(
        `aria_chess_profiles?user_id=eq.${enc(uid)}&select=*`,
        {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify({
            display_name: displayName,
            rating: ratingAfter,
            skill_estimate: skillAfter,
            aria_difficulty: difficultyAfter,
            avg_move_quality: avgMoveQuality,
            games_played: gamesAfter,
            wins: winsAfter,
            losses: lossesAfter,
            draws: drawsAfter,
            current_streak: currentStreak,
            best_win_streak: bestWinStreak,
            updated_at: new Date().toISOString(),
          }),
        }
      );

      const newRewards = result === 'win'
        ? await unlockChessWinGifts(uid, winsAfter)
        : [];

      return json(request, {
        data: rows[0] || null,
        newRewards,
        gifts: await chessGiftRows(uid),
      });
    }

    if (action === 'get_game_session') {
      const gameKey = String(body?.gameKey || '').trim().toLowerCase();
      if (!/^[a-z0-9_-]{1,40}$/.test(gameKey)) {
        return json(request, { error: 'Invalid game key' }, 400);
      }

      const rows = await supabaseAdminRest<any[]>(
        `aria_game_sessions?select=id,game_key,status,state,settings,started_at,updated_at&user_id=eq.${enc(uid)}&game_key=eq.${enc(gameKey)}&limit=1`
      );
      return json(request, { data: rows[0] || null });
    }

    if (action === 'save_game_session') {
      const gameKey = String(body?.gameKey || '').trim().toLowerCase();
      if (!/^[a-z0-9_-]{1,40}$/.test(gameKey)) {
        return json(request, { error: 'Invalid game key' }, 400);
      }

      const status = ['active', 'finished', 'abandoned'].includes(String(body?.status))
        ? String(body.status)
        : 'active';
      const state = body?.state && typeof body.state === 'object' && !Array.isArray(body.state)
        ? body.state
        : {};
      const settings = body?.settings && typeof body.settings === 'object' && !Array.isArray(body.settings)
        ? body.settings
        : {};

      if (JSON.stringify(state).length > 80000 || JSON.stringify(settings).length > 20000) {
        return json(request, { error: 'Game session is too large' }, 413);
      }

      const rows = await supabaseAdminRest<any[]>(
        'aria_game_sessions?on_conflict=user_id,game_key&select=id,game_key,status,state,settings,started_at,updated_at',
        {
          method: 'POST',
          headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
          body: JSON.stringify([{
            user_id: uid,
            game_key: gameKey,
            status,
            state,
            settings,
            updated_at: new Date().toISOString(),
          }]),
        }
      );

      return json(request, { data: rows[0] || null });
    }

    if (action === 'get_music_session') {
      const rows = await supabaseAdminRest<any[]>(
        `aria_music_sessions?select=id,current_track_id,playback_seconds,is_minimized,queue,chat_history,settings,updated_at&user_id=eq.${enc(uid)}&limit=1`
      );
      return json(request, { data: rows[0] || null });
    }

    if (action === 'save_music_session') {
      const currentTrackId = body?.currentTrackId
        ? String(body.currentTrackId).trim().slice(0, 140)
        : null;
      const playbackSeconds = Math.min(
        86400,
        Math.max(0, Number(body?.playbackSeconds || 0))
      );
      const isMinimized = Boolean(body?.isMinimized);
      const queue = Array.isArray(body?.queue)
        ? body.queue.slice(0, 200).map((value: unknown) => String(value).slice(0, 140))
        : [];
      const chatHistory = Array.isArray(body?.chatHistory)
        ? body.chatHistory.slice(-80)
        : [];
      const settings = body?.settings && typeof body.settings === 'object' && !Array.isArray(body.settings)
        ? body.settings
        : {};

      if (
        JSON.stringify(chatHistory).length > 100000 ||
        JSON.stringify(settings).length > 20000
      ) {
        return json(request, { error: 'Music session is too large' }, 413);
      }

      const rows = await supabaseAdminRest<any[]>(
        'aria_music_sessions?on_conflict=user_id&select=id,current_track_id,playback_seconds,is_minimized,queue,chat_history,settings,updated_at',
        {
          method: 'POST',
          headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
          body: JSON.stringify([{
            user_id: uid,
            current_track_id: currentTrackId,
            playback_seconds: Number.isFinite(playbackSeconds) ? playbackSeconds : 0,
            is_minimized: isMinimized,
            queue,
            chat_history: chatHistory,
            settings,
            updated_at: new Date().toISOString(),
          }]),
        }
      );

      return json(request, { data: rows[0] || null });
    }

    if (action === 'list_music_catalog') {
      const data = await supabaseAdminRest<any[]>(
        'aria_music_catalog?select=id,artist,title,youtube_video_id,source_type,audio_url,album_title,album_slug,track_number,cover_url,duration_seconds,narrative_es,narrative_en,narrative_de,featured,sort_order,metadata&active=eq.true&order=sort_order.asc,created_at.asc'
      );
      return json(request, { data });
    }

    if (action === 'list_music_discography') {
      const data = await supabaseAdminRest<any[]>(
        'aria_music_albums?select=id,artist,title,slug,release_year,kind,cover_url,sort_order,metadata&active=eq.true&order=sort_order.asc,release_year.asc'
      );
      return json(request, { data });
    }

    if (action === 'get_music_library') {
      return json(request, { data: await musicLibraryState(uid) });
    }

    if (action === 'create_music_playlist') {
      const name = String(body?.name || '').trim().replace(/\s+/g, ' ').slice(0, 60);
      if (!name) return json(request, { error: 'Playlist name is required' }, 400);

      const rows = await supabaseAdminRest<any[]>(
        'aria_music_playlists?select=id,name,description,is_default,created_at,updated_at',
        {
          method: 'POST',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify([{
            user_id: uid,
            name,
            description: body?.description ? String(body.description).trim().slice(0, 240) : null,
            is_default: false,
          }]),
        }
      );
      return json(request, { data: rows[0] || null });
    }

    if (action === 'delete_music_playlist') {
      const playlistId = String(body?.playlistId || '');
      if (!playlistId || !(await ownsMusicPlaylist(uid, playlistId))) {
        return json(request, { error: 'Playlist not found' }, 404);
      }

      await supabaseAdminRest(
        `aria_music_playlists?id=eq.${enc(playlistId)}&user_id=eq.${enc(uid)}&is_default=eq.false`,
        { method: 'DELETE' }
      );
      return json(request, { ok: true });
    }

    if (action === 'add_music_playlist_track') {
      const playlistId = String(body?.playlistId || '');
      const trackId = String(body?.trackId || '').trim().slice(0, 140);
      if (!playlistId || !(await ownsMusicPlaylist(uid, playlistId))) {
        return json(request, { error: 'Playlist not found' }, 404);
      }
      const tracks = await supabaseAdminRest<any[]>(
        `aria_music_catalog?select=id&id=eq.${enc(trackId)}&active=eq.true&limit=1`
      );
      if (!tracks[0]) return json(request, { error: 'Track not found' }, 404);

      const countRows = await supabaseAdminRest<any[]>(
        `aria_music_playlist_items?select=track_id&user_id=eq.${enc(uid)}&playlist_id=eq.${enc(playlistId)}`
      );

      await supabaseAdminRest(
        'aria_music_playlist_items?on_conflict=playlist_id,track_id',
        {
          method: 'POST',
          headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' },
          body: JSON.stringify([{
            playlist_id: playlistId,
            user_id: uid,
            track_id: trackId,
            position: countRows.length,
          }]),
        }
      );

      await supabaseAdminRest(
        `aria_music_playlists?id=eq.${enc(playlistId)}&user_id=eq.${enc(uid)}`,
        {
          method: 'PATCH',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({ updated_at: new Date().toISOString() }),
        }
      );

      return json(request, { ok: true });
    }

    if (action === 'remove_music_playlist_track') {
      const playlistId = String(body?.playlistId || '');
      const trackId = String(body?.trackId || '').trim().slice(0, 140);
      if (!playlistId || !(await ownsMusicPlaylist(uid, playlistId))) {
        return json(request, { error: 'Playlist not found' }, 404);
      }

      await supabaseAdminRest(
        `aria_music_playlist_items?playlist_id=eq.${enc(playlistId)}&track_id=eq.${enc(trackId)}&user_id=eq.${enc(uid)}`,
        { method: 'DELETE' }
      );
      return json(request, { ok: true });
    }

    if (action === 'toggle_music_favorite') {
      const trackId = String(body?.trackId || '').trim().slice(0, 140);
      const tracks = await supabaseAdminRest<any[]>(
        `aria_music_catalog?select=id&id=eq.${enc(trackId)}&active=eq.true&limit=1`
      );
      if (!tracks[0]) return json(request, { error: 'Track not found' }, 404);

      const existing = await supabaseAdminRest<any[]>(
        `aria_music_favorites?select=track_id&user_id=eq.${enc(uid)}&track_id=eq.${enc(trackId)}&limit=1`
      );

      if (existing[0]) {
        await supabaseAdminRest(
          `aria_music_favorites?user_id=eq.${enc(uid)}&track_id=eq.${enc(trackId)}`,
          { method: 'DELETE' }
        );
        return json(request, { favorite: false });
      }

      await supabaseAdminRest(
        'aria_music_favorites?on_conflict=user_id,track_id',
        {
          method: 'POST',
          headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' },
          body: JSON.stringify([{ user_id: uid, track_id: trackId }]),
        }
      );
      return json(request, { favorite: true });
    }

    if (action === 'submit_music_request') {
      const artist = String(body?.artist || '').trim().replace(/\s+/g, ' ').slice(0, 100);
      const title = String(body?.title || '').trim().replace(/\s+/g, ' ').slice(0, 140);
      const note = body?.note ? String(body.note).trim().slice(0, 400) : null;
      if (!artist || !title) {
        return json(request, { error: 'Artist and title are required' }, 400);
      }

      const rows = await supabaseAdminRest<any[]>(
        'aria_music_requests?select=id,artist,title,note,status,created_at',
        {
          method: 'POST',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify([{
            user_id: uid,
            artist,
            title,
            note,
            status: 'requested',
          }]),
        }
      );
      return json(request, { data: rows[0] || null });
    }

    if (action === 'get_music_rhythm_profile') {
      const existing = await supabaseAdminRest<any[]>(
        `aria_music_rhythm_profiles?select=*&user_id=eq.${enc(uid)}&limit=1`
      );
      if (existing[0]) return json(request, { data: existing[0] });

      const rows = await supabaseAdminRest<any[]>(
        'aria_music_rhythm_profiles?on_conflict=user_id&select=*',
        {
          method: 'POST',
          headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
          body: JSON.stringify([{
            user_id: uid,
            calibration_ms: 0,
            best_score: 0,
            total_sessions: 0,
            unlocked_modes: ['preview'],
            settings: {},
          }]),
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
      const existing = await supabaseAdminRest<any[]>(
        `aria_memory_items?select=id&user_id=eq.${enc(uid)}&content=eq.${enc(content)}&limit=1`
      );

      if (existing[0]?.id) {
        const rows = await supabaseAdminRest<any[]>(
          `aria_memory_items?id=eq.${enc(existing[0].id)}&user_id=eq.${enc(uid)}&select=*`,
          {
            method: 'PATCH',
            headers: { Prefer: 'return=representation' },
            body: JSON.stringify({
              scope,
              project_key: body?.projectKey ? String(body.projectKey).slice(0, 160) : null,
              conversation_id: conversationId,
              kind,
              importance,
              confidence,
              embedding: vector,
              source: body?.source ? String(body.source).slice(0, 80) : 'assistant',
              metadata: body?.metadata && typeof body.metadata === 'object' ? body.metadata : {},
              updated_at: new Date().toISOString(),
            }),
          }
        );
        return json(request, { data: rows[0] || null, deduplicated: true });
      }

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
          p_conversation_id: body?.conversationId ? String(body.conversationId) : null,
          p_project_key: body?.projectKey ? String(body.projectKey).slice(0, 160) : null,
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

      const excludeConversationId = body?.excludeConversationId
        ? String(body.excludeConversationId)
        : '';
      const conversations = await supabaseAdminRest<any[]>(
        `aria_conversaciones?select=id,titulo&user_id=eq.${enc(uid)}&order=updated_at.desc&limit=50`
      );
      const filteredConversations = excludeConversationId
        ? conversations.filter((item) => item.id !== excludeConversationId)
        : conversations;
      const ids = filteredConversations.map((item) => item.id).filter(Boolean);
      if (!ids.length) return json(request, { data: [] });

      const messages = await supabaseAdminRest<any[]>(
        `aria_mensajes?select=conversacion_id,rol,contenido,engine,fecha&conversacion_id=in.(${ids.join(',')})&order=fecha.desc&limit=500`
      );

      const titleById = new Map(filteredConversations.map((item) => [item.id, item.titulo]));
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
