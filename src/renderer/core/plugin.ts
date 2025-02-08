import { getLogger } from '@fe/utils'

const logger = getLogger('plugin')

export interface Plugin<Ctx = any> {
  name: string;
  register?: (ctx: Ctx) => any;
}

const plugins: {[name: string]: Plugin} = {}
const apis: {[name: string]: any} = {}

/**
 * Register a plugin.
 * @param plugin
 * @param ctx
 */
export function register <Ctx> (plugin: Plugin<Ctx>, ctx: Ctx) {
  logger.debug('register', plugin)

  if (plugins[plugin.name]) {
    logger.error(`Plugin [${plugin.name}] already registered.`)
    return
  }

  plugins[plugin.name] = plugin
  apis[plugin.name] = plugin.register && plugin.register(ctx)
}

/**
 * Get a plugin exported api.
 * @param name
 * @returns
 */
export function getApi <T = any> (name: string): T {
  return apis[name]
}

/**
 * Initialization plugin system and register build-in plugins
 * @param plugins
 * @param ctx
 */
export function init <Ctx> (plugins: Plugin[], ctx: Ctx) {
  logger.debug('init')

  plugins.forEach((plugin) => {
    register(plugin, ctx)
  })

  window.registerPlugin = (plugin: Plugin) => register(plugin, ctx)

  const script = window.document.createElement('script')
  script.src = '/api/plugins'
  window.document.body.appendChild(script)
}
