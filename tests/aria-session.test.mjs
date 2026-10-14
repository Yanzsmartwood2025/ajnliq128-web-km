import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'
import ts from 'typescript'

async function mount({ user = { getIdToken: async () => 'fixture-id' }, requestId = '12345678-1234-1234-1234-123456789012', openerPresent = true } = {}) {
  let cursor = 0
  const states = [], previous = [], pending = [], sent = [], redirects = [], calls = []
  const listeners = new Map(), opener = { postMessage: (data, origin) => sent.push({ data, origin }) }
  let closed = false
  const window = { opener: openerPresent ? opener : null, location: { search: '?requestId=' + requestId },
    addEventListener: (name, cb) => listeners.set(name, cb), removeEventListener: name => listeners.delete(name),
    close: () => { closed = true }, setTimeout, clearTimeout }
  const modules = {
    react: { useState(value) { const i = cursor++; if (!(i in states)) states[i] = value; return [states[i], next => { states[i] = next }] },
      useEffect(callback, deps) { const i = cursor++; if (!previous[i] || deps.some((d, j) => d !== previous[i][j])) { previous[i] = deps; pending.push(callback) } } },
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }) },
    'next/navigation': { useRouter: () => router }, '@/lib/auth-context': { useAuth: () => ({ user, loading: false }) },
    '@/components/AriaLaunchScreen': { AriaLaunchScreen: 'Logo' }
  }
  const router = { replace: url => redirects.push(url) }, exports = {}
  const source = await readFile(new URL('../app/aria/session/page.tsx', import.meta.url), 'utf8')
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText
  vm.runInNewContext(code, { exports, require: name => modules[name], process: { env: {} }, window, URL, URLSearchParams, AbortController,
    fetch: async (url, options) => { calls.push({ url, options }); return { ok: true, json: async () => ({ customToken: 'fixture-custom' }) } } })
  const render = async () => { cursor = 0; exports.default(); pending.splice(0).forEach(effect => effect()); await new Promise(resolve => setTimeout(resolve, 0)) }
  await render(); await render()
  return { states, sent, redirects, calls, get closed() { return closed }, async message(type, { origin = 'https://aria-llm.vercel.app', source = opener, nonce = requestId } = {}) {
    listeners.get('message')?.({ origin, source, data: { type, requestId: nonce } }); await render()
  } }
}

test('authorization waits for a request from the exact app window, origin and nonce', async () => {
  const app = await mount()
  assert.equal(app.calls.length, 0)
  assert.equal(app.sent[0].data.type, 'AJN_ARIA_SSO_READY')
  for (const invalid of [{ origin: 'https://evil.example' }, { source: {} }, { nonce: 'different' }]) await app.message('AJN_ARIA_SSO_REQUEST', invalid)
  assert.equal(app.calls.length, 0)
  await app.message('AJN_ARIA_SSO_REQUEST')
  assert.equal(app.calls.length, 1)
  assert.equal(app.calls[0].options.headers.Authorization, 'Bearer fixture-id')
  const response = app.sent.find(message => message.data.type === 'AJN_ARIA_SSO_RESPONSE')
  assert.equal(response.origin, 'https://aria-llm.vercel.app')
  assert.equal(response.data.customToken, 'fixture-custom')
  await app.message('AJN_ARIA_SSO_ACK', { origin: 'https://evil.example' })
  assert.equal(app.closed, false)
  await app.message('AJN_ARIA_SSO_ACK')
  assert.equal(app.closed, true)
})

test('anonymous authorization returns to Home with a fixed destination and no credentials', async () => {
  const app = await mount({ user: null })
  await app.message('AJN_ARIA_SSO_REQUEST')
  const url = new URL(app.redirects[0], 'https://ajnliq128.vercel.app')
  assert.equal(url.pathname, '/')
  assert.equal(url.searchParams.get('next'), '/aria/session')
  assert.equal(url.searchParams.get('requestId'), '12345678-1234-1234-1234-123456789012')
  assert.equal(app.calls.length, 0)
})

test('invalid nonce and a page without an opener cannot create a session', async () => {
  for (const options of [{ requestId: 'bad' }, { openerPresent: false }]) {
    const app = await mount(options)
    assert.equal(app.calls.length, 0)
    assert.equal(app.sent.length, 0)
    assert.ok(app.states[2])
  }
})
