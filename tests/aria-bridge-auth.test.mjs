import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const source = (path) => readFile(new URL('../' + path, import.meta.url), 'utf8')

test('AJN bridges the current Firebase account to arIA without tokens in URLs', async () => {
  const page = await source('app/aria/aria/page.tsx')
  assert.match(page, /const currentToken = await currentUser\.getIdToken\(\)/)
  assert.match(page, /await currentUser\.getIdToken\(true\)/)
  assert.match(page, /params\.set\('source', 'ajnliq128'\)/)
  assert.match(page, /AJN_ARIA_TOKEN_REQUEST/)
  assert.match(page, /AJN_ARIA_TOKEN_RESPONSE/)
  assert.match(page, /event\.source !== iframeRef\.current\?\.contentWindow/)
  assert.doesNotMatch(page, /target\.hash\s*=\s*`idToken/)
  assert.doesNotMatch(page, /encodeURIComponent\(idToken\)/)
})

test('AJN login fields use placeholders, never real passwords as default values', async () => {
  const form = await source('components/auth-form.tsx')
  assert.match(form, /placeholder="tu\.correo@ejemplo\.com"/)
  assert.match(form, /placeholder="••••••••"/)
  assert.doesNotMatch(form, /defaultValue=\{.*password/i)
})
