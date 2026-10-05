import assert from 'node:assert/strict';
import test from 'node:test';
import { createEditorBridgePayload } from '../lib/editorBridgeToken.mjs';

test('creates the custom token expected by the Editor and includes the Supabase role', async () => {
  const calls = [];
  const auth = {
    async createCustomToken(uid, claims) {
      calls.push({ uid, claims });
      return 'fresh-editor-token';
    },
  };

  const payload = await createEditorBridgePayload(auth, 'firebase-user-123');

  assert.deepEqual(calls, [{ uid: 'firebase-user-123', claims: { role: 'authenticated' } }]);
  assert.deepEqual(payload, { customToken: 'fresh-editor-token' });
});
