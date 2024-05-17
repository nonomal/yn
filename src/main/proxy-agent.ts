/* eslint-disable @typescript-eslint/no-var-requires */
import { session } from 'electron'
import { Dispatcher, ProxyAgent } from 'undici'
import { socksDispatcher } from './undici-socket-agent'
const SocksProxyAgent = require('socks-proxy-agent')
const HttpsProxyAgent = require('https-proxy-agent')
const HttpProxyAgent = require('http-proxy-agent')

export function newProxyAgent (proxyUrl: string) {
  if (proxyUrl.toLowerCase().startsWith('socks://')) {
    return new SocksProxyAgent(proxyUrl)
  } else if (proxyUrl.toLowerCase().startsWith('https://')) {
    return new HttpProxyAgent(proxyUrl)
  } else {
    return new HttpsProxyAgent(proxyUrl)
  }
}

export function newProxyDispatcher (proxyUrl: string): Dispatcher {
  if (proxyUrl.toLowerCase().startsWith('socks://') || proxyUrl.toLowerCase().startsWith('socks5://')) {
    const url = new URL(proxyUrl)
    return socksDispatcher({
      type: 5,
      host: url.hostname,
      port: +url.port
    })
  }

  return new ProxyAgent(proxyUrl)
}

export async function getProxyAgent (url: string) {
  const proxy = await session.defaultSession.resolveProxy(url)
  if (!proxy) {
    return undefined
  }

  const proxies = String(proxy).trim().split(/\s*;\s*/g).filter(Boolean)
  const first = proxies[0]
  const parts = first.split(/\s+/)
  const type = parts[0]

  if (type === 'SOCKS' || type === 'SOCKS5') {
    // use a SOCKS proxy
    return new SocksProxyAgent('socks://' + parts[1])
  } else if (type === 'PROXY' || type === 'HTTPS') {
    // use an HTTP or HTTPS proxy
    // http://dev.chromium.org/developers/design-documents/secure-web-proxy
    const proxyURL = (type === 'HTTPS' ? 'https' : 'http') + '://' + parts[1]
    if (/^https:\/\//i.test(url)) {
      return new HttpsProxyAgent(proxyURL)
    } else {
      return new HttpProxyAgent(proxyURL)
    }
  }

  return undefined
}

export async function getProxyDispatcher (url: string): Promise<Dispatcher | undefined> {
  const proxy = await session.defaultSession.resolveProxy(url)
  if (!proxy) {
    return undefined
  }

  const proxies = String(proxy).trim().split(/\s*;\s*/g).filter(Boolean)
  const first = proxies[0]
  const parts = first.split(/\s+/)
  const type = parts[0]

  let proxyUrl = ''
  if (type === 'SOCKS' || type === 'SOCKS5') {
    // use a SOCKS proxy
    proxyUrl = 'socks://' + parts[1]
  } else if (type === 'PROXY' || type === 'HTTPS') {
    proxyUrl = (type === 'HTTPS' ? 'https' : 'http') + '://' + parts[1]
  } else {
    return undefined
  }

  return newProxyDispatcher(proxyUrl)
}
