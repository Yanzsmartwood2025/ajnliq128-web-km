import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'
import ts from 'typescript'

async function mount(path, { user = null, loading = false, query = '' } = {}) {
  const effects = [], redirects = [], states = []
  let cursor = 0
  const jsx = (type, props) => ({ type, props })
  const router = { replace: url => redirects.push(url), push: url => redirects.push(url), prefetch() {} }
  const modules = {
    react: { useEffect: callback => effects.push(callback), useMemo: callback => callback(), useRef: value => ({ current: value }), useState: value => {
      const index = cursor++; if (!(index in states)) states[index] = typeof value === 'function' ? value() : value
      return [states[index], value => { states[index] = typeof value === 'function' ? value(states[index]) : value }]
    }, useCallback: callback => callback, useTransition: () => [false, callback => callback()] },
    'react/jsx-runtime': { jsx, jsxs: jsx },
    'next/navigation': { useRouter: () => router, useSearchParams: () => new URLSearchParams(query) },
    '@/lib/auth-context': { useAuth: () => ({ user, loading }) },
    '@/lib/media-urls': { mediaUrl: path => path },
    'framer-motion': { motion: { div: 'div' }, AnimatePresence: 'div' },
  }
  const source = await readFile(new URL('../' + path, import.meta.url), 'utf8')
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText
  const exports = {}
  const win = { location: { origin: 'https://ajnliq128.vercel.app', search: '?' + query, href: 'https://ajnliq128.vercel.app/?' + query }, history: { replaceState() {} }, addEventListener() {}, removeEventListener() {}, setTimeout, clearTimeout }
  vm.runInNewContext(code, { exports, require: name => modules[name] || { default: () => null }, process: { env: {} }, window: win,
    URL, URLSearchParams, localStorage: { getItem: () => null, removeItem() {} }, fetch: async () => ({ ok: true }) })
  const Component = exports.default || exports.FuegoHome
  Component()
  effects.forEach(callback => callback())
  await new Promise(resolve => setTimeout(resolve, 0))
  return { redirects, states }
}

test('AJN waits for Firebase restoration before deciding to redirect', async () => {
  const result = await mount('app/aria/aria/page.tsx', { loading: true })
  assert.deepEqual(result.redirects, [])
})

test('anonymous arIA bridge returns to central Home login with its destination', async () => {
  const result = await mount('app/aria/aria/page.tsx')
  assert.equal(result.redirects[0], '/?login=true&skipIntro=1&next=%2Faria%2Faria')
})

test('signed-in central account opens arIA without another login', async () => {
  const result = await mount('app/aria/aria/page.tsx', { user: { getIdToken: async () => 'private-token' } })
  assert.deepEqual(result.redirects, [])
  const url = new URL(result.states[0])
  assert.equal(url.origin, 'https://aria-llm.vercel.app')
  assert.equal(url.searchParams.get('source'), 'ajnliq128')
  assert.equal(url.hash, '')
})

test('central Home resumes arIA after login', async () => {
  const result = await mount('components/fuego-home.tsx', { user: {}, query: 'skipIntro=1&login=true&next=%2Faria%2Faria' })
  assert.equal(result.redirects[0], '/aria/aria')
})

test('central Home never follows a foreign login destination', async () => {
  const result = await mount('components/fuego-home.tsx', { user: {}, query: 'skipIntro=1&login=true&next=https%3A%2F%2Fevil.example' })
  assert.deepEqual(result.redirects, [])
})
