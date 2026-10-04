import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { apply } from '../index.js'

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))

function contextWithDisabledCoreProvider(trustedHosts = ['remote.example.test:13830']) {
  const subscriptions = []
  const ctx = {
    loader: {
      entries: () => [{ options: { name: '@deepseek-ai/dsh-client-ui-settings' }, disabled: true }],
    },
    get: key => key === 'webRuntime' ? { trustedHosts } : undefined,
    on: (event, listener) => subscriptions.push({ event, listener }),
  }
  return { ctx, subscriptions }
}

test('forwards the Web runtime Host trust list through the authenticated index event', () => {
  const authorities = ['remote.example.test:13830', '198.51.100.8']
  const { ctx, subscriptions } = contextWithDisabledCoreProvider(authorities)
  apply(ctx)
  assert.equal(subscriptions.length, 1)
  assert.equal(subscriptions[0].event, 'webserver/index-inject')
  const table = []
  subscriptions[0].listener(table)
  assert.deepEqual(table, [{
    kind: 'global',
    name: '__DSH_SETTINGS_TRUSTED_AUTHORITIES__',
    value: authorities,
  }])
})

test('fails closed if the Web runtime trust list is malformed', () => {
  const { ctx } = contextWithDisabledCoreProvider(['remote.example.test/settings'])
  ctx.get = () => ({ trustedHosts: [42] })
  assert.throws(() => apply(ctx), /webRuntime\.trustedHosts must be a string array/)
})

test('fails closed if the built-in provider is still enabled', () => {
  const { ctx } = contextWithDisabledCoreProvider()
  ctx.loader.entries = () => [{ options: { name: '@deepseek-ai/dsh-client-ui-settings' }, disabled: false }]
  assert.throws(() => apply(ctx), /must be present and disabled/)
})

test('client bundle identity matches the installable package name', async () => {
  const priorWindow = globalThis.window
  let registered
  globalThis.window = { __ModuleLoader__: { load: bundle => { registered = bundle } } }
  try {
    await import(`../client.js?module-id-check=${Date.now()}`)
    assert.equal(registered.id, packageJson.name)
  } finally {
    if (priorWindow === undefined) delete globalThis.window
    else globalThis.window = priorWindow
  }
})
