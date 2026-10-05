export async function createEditorBridgePayload(auth, uid) {
  return {
    customToken: await auth.createCustomToken(uid, { role: 'authenticated' }),
  };
}
