export const name = 'dsh-settings-trusted-authority-plugin'
export const inject = ['loader', 'webRuntime', 'webServer']

export function apply(ctx) {
  const providers = [...ctx.loader.entries()]
    .filter(entry => entry.options.name === '@deepseek-ai/dsh-client-ui-settings')
  if (providers.length !== 1 || providers[0].disabled !== true) {
    throw new Error('the built-in ui-settings provider must be present and disabled by this bundle')
  }

  const webRuntime = ctx.get('webRuntime')
  const authorities = webRuntime?.trustedHosts
  if (!Array.isArray(authorities) || !authorities.every(authority => typeof authority === 'string')) {
    throw new TypeError('webRuntime.trustedHosts must be a string array')
  }

  ctx.on('webserver/index-inject', (table) => {
    table.push({
      kind: 'global',
      name: '__DSH_SETTINGS_TRUSTED_AUTHORITIES__',
      value: [...authorities],
    })
  })
}
