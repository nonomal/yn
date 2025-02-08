import { setTheme } from '@fe/services/theme'
import * as storage from '@fe/utils/storage'
import { FLAG_DEMO } from '@fe/support/args'
import { useToast } from '@fe/support/ui/toast'
import { getRenderIframe } from '@fe/services/view'
import { t } from '@fe/services/i18n'

let settings = {
  repositories: { test: '/path_test' },
  shell: 'bash',
  mark: [
    { repo: 'test', path: '/TODO.md' }
  ]
}

const treeData = {
  status: 'ok',
  message: 'success',
  data: [
    {
      name: '/',
      type: 'dir',
      path: '/',
      repo: 'test',
      level: 1,
      children: [
        { name: 'Work', path: '/Work', type: 'dir', repo: 'test', level: 2, children: [{ name: '1.md', path: '/Work/1.md', type: 'file', repo: 'test', level: 3, marked: false, birthtime: 1623635402958.447, mtime: 1623635402958.447 }, { name: '2.md', path: '/Work/2.md', type: 'file', repo: 'test', level: 3, marked: false, birthtime: 1623635406528.4639, mtime: 1623635406528.4639 }, { name: '3.md', path: '/Work/3.md', type: 'file', repo: 'test', level: 3, marked: false, birthtime: 1623635410176.051, mtime: 1623635410177.0498 }] },
        { name: 'Learn', path: '/Learn', type: 'dir', repo: 'test', level: 2, children: [{ name: 'a.md', path: '/Learn/a.md', type: 'file', repo: 'test', level: 3, marked: false, birthtime: 1623635423871.2678, mtime: 1623635423871.2678 }, { name: 'b.md', path: '/Learn/b.md', type: 'file', repo: 'test', level: 3, marked: false, birthtime: 1623635427472.3079, mtime: 1623635427472.3079 }, { name: 'c.md', path: '/Learn/c.md', type: 'file', repo: 'test', level: 3, marked: false, birthtime: 1623635431935.041, mtime: 1623635431935.041 }] },
        { name: 'TEST.md', path: '/TEST.md', type: 'file', repo: 'test', level: 2, marked: false, birthtime: 1623635389096.3315, mtime: 1623635389097.3403 },
        { name: 'TODO.md', path: '/TODO.md', type: 'file', repo: 'test', level: 2, marked: false, birthtime: 1623635437968.1262, mtime: 1623635437969.1235 },
        { name: 'Secret.c.md', path: '/Secret.c.md', type: 'file', repo: 'test', level: 2, marked: false, birthtime: 1623635542753.2976, mtime: 1623635542753.2976 },
        { name: 'Project.luckysheet', path: '/Project.luckysheet', type: 'file', repo: 'test', level: 2, marked: false, birthtime: 1623635542753.2976, mtime: 1623635542753.2976 },
        { name: 'Drawio.drawio', path: '/Drawio.drawio', type: 'file', repo: 'test', level: 2, marked: false, birthtime: 1623635542753.2976, mtime: 1623635542753.2976 },
        { name: 'Reveal-js.md', path: '/Reveal-js.md', type: 'file', repo: 'test', level: 2, marked: false, birthtime: 1623635542753.2976, mtime: 1623635542753.2976 },
        { name: 'Markmap.md', path: '/Markmap.md', type: 'file', repo: 'test', level: 2, marked: false, birthtime: 1623635542753.2976, mtime: 1623635542753.2976 },
      ]
    }]
}

const markupContent = `---
defaultPreviewer: 'Markmap'
---

# markmap

## Links

- <https://markmap.js.org/>
- [GitHub](https://github.com/gera2ld/markmap)

## Related Projects

- [coc-markmap](https://github.com/gera2ld/coc-markmap)
- [gatsby-remark-markmap](https://github.com/gera2ld/gatsby-remark-markmap)

## Features

- links
- **strong** ~~del~~ *italic* ==highlight==
- multiline
  text
- \`inline code\`
-
    \`\`\`js
    console.log('code block');
    \`\`\`
- Katex
  - $x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}$
  - [More Katex Examples](#?d=gist:gera2ld/af76a4c245b302206b16aec503dbe07b:katex.md)
`

const revealJsContent = `---
defaultPreviewer: 'Reveal.js'
---

::: section
## Slide 1 {style="color:red"}

\`\`\`js
await new Promise(r => setTimeout(r, 500))
ctx.ui.useToast().show("info", "HELLOWORLD!")
console.log("hello world!")
\`\`\`
:::

::: section
## Horizontal Slide

$$
\\nabla \\cdot \\vec{\\mathbf{B}}  = 0
$$
:::

::::: section
### Vertical Slide

::: section
### Vertical Slide 1

+ Subject{.mindmap}
    + Topic 1
    + Topic 2
    + Topic 3
    + Topic 4

:::
::: section
### Vertical Slide 2

\`\`\`mermaid
graph LR
A[Hard] --> |Text| B(Round)
\`\`\`

:::
::: section
### Vertical Slide 3

@startuml
a -> b
@enduml

:::
:::::
`

if (FLAG_DEMO) {
  storage.clear()
  setTheme('dark')

  const xFetch = window.fetch
  const xOpen = window.open
  const cache: {[key: string]: string} = {}

  const handleImgError = (e: ErrorEvent) => {
    const target = e.target as HTMLImageElement
    if (target.tagName === 'IMG' || target.tagName === 'VIDEO') {
      if (target.src.includes('/api/plantuml')) {
        target.src = 'data:image/png;base64,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'
      } else if (target.src.includes('/api/help')) {
        const url = new URL(target.src)
        const path = url.searchParams.get('path')
        if (path) {
          target.src = path.replace(/^.\//, '/')
        }
      }
    } else {
      console.error(e)
    }
  }

  window.addEventListener('error', handleImgError, true)
  getRenderIframe().then(iframe => {
    iframe.contentWindow!.addEventListener('error', handleImgError, true)
  })

  const fakeFetch = (uri: any, init: any) => Promise.resolve({
    headers: { get: () => 'application/json' },
    json: () => {
      console.log('mock api json >', uri, init)

      const url = new URL(location.origin + uri)
      const method = (init && init.method) || 'GET'

      if (uri.startsWith('/api/settings')) {
        if (method === 'POST') {
          settings = { ...settings, ...JSON.parse(init.body) }
        }

        return Promise.resolve({
          status: 'ok',
          message: 'success',
          data: JSON.parse(JSON.stringify(settings))
        })
      }

      if (uri.startsWith('/api/mark')) {
        return Promise.resolve({ status: 'ok', message: 'success', data: {} })
      }

      if (uri.startsWith('/api/repositories')) {
        return Promise.resolve({ status: 'ok', message: 'success', data: { test: '/test' } })
      }

      if (uri.startsWith('/api/tree')) {
        return Promise.resolve(treeData)
      }

      if (uri.startsWith('/api/history/list')) {
        return Promise.resolve({ status: 'ok', message: 'success', data: [{ name: '2022-01-01 12-12-00.md', comment: 'Test' }, { name: '2022-01-01 12-13-00.md', comment: '--marked--' }, { name: '2022-01-01 12-14-00.md', comment: '' }] })
      }

      if (uri.startsWith('/api/history/content')) {
        return Promise.resolve({ status: 'ok', message: 'success', data: `${url.searchParams.get('version')}\nA\nB` })
      }

      if (uri.startsWith('/api/help') || uri.startsWith('/api/file')) {
        if (method === 'POST') {
          return Promise.resolve({ status: 'ok', message: 'success' })
        } else if (method === 'GET') {
          if ((url.searchParams.get('path') || '').includes('Reveal-js.md')) {
            const content = revealJsContent
            return Promise.resolve({
              status: 'ok',
              message: 'success',
              data: { content, hash: 'test' }
            })
          }

          if ((url.searchParams.get('path') || '').includes('Markmap.md')) {
            const content = markupContent
            return Promise.resolve({
              status: 'ok',
              message: 'success',
              data: { content, hash: 'test' }
            })
          }

          if ((url.searchParams.get('path') || '').includes('_FRAGMENT.md')) {
            const content = "---\ncustomVarFromOtherDoc: Hello, It's Me.\ndefine:\n    --TEST_DEFINE--: definition from a fragment.\n---\n*Content from a fragment.*"
            return Promise.resolve({
              status: 'ok',
              message: 'success',
              data: { content, hash: 'test' }
            })
          }

          if ((url.searchParams.get('path') || '').endsWith('.luckysheet')) {
            const content = JSON.stringify([{
              name: 'Sheet1',
              color: '',
              status: 1,
              order: 0,
              data: Array(20).fill(Array(14).fill(null)),
              config: {
                merge: {},
                rowlen: {},
                rowhidden: {}
              },
              index: 0,
              jfgird_select_save: [],
              luckysheet_select_save: [{
                row: [0, 0],
                column: [0, 0],
                row_focus: 0,
                column_focus: 0,
                left: 0,
                width: 73,
                top: 0,
                height: 19,
                left_move: 0,
                width_move: 73,
                top_move: 0,
                height_move: 19
              }],
              visibledatarow: [],
              visibledatacolumn: [],
              ch_width: 4560,
              rh_height: 1760,
              luckysheet_selection_range: [],
              zoomRatio: 1,
              scrollLeft: 0,
              scrollTop: 0,
              calcChain: [],
              filter_select: null,
              filter: null,
              luckysheet_conditionformat_save: [],
              luckysheet_alternateformat_save: [],
              dataVerification: {},
              hyperlink: {},
              celldata: []
            }])
            return Promise.resolve({
              status: 'ok',
              message: 'success',
              data: { content, hash: 'test' }
            })
          }

          if ((url.searchParams.get('path') || '').endsWith('.drawio')) {
            const content = '<mxfile modified="2019-08-08T10:12:50.344Z" host="" agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) draw.master/1.1.2 Chrome/76.0.3809.88 Electron/6.0.0 Safari/537.36" etag="Sj0MCp6T4t3TRFXfBnGH" version="11.1.1" type="device"><diagram name="Page-1" id="c7558073-3199-34d8-9f00-42111426c3f3">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</diagram></mxfile>'
            return Promise.resolve({
              status: 'ok',
              message: 'success',
              data: { content, hash: 'test' }
            })
          }

          const path = '/' + (url.searchParams.get('doc')?.replace(/^\//, '') || 'FEATURES.md')
          const data = {
            status: 'ok',
            message: 'success',
            data: {
              content: '',
              hash: 'test'
            }
          }

          const replaceContnet = (str: string) => {
            const message = (url.searchParams.get('doc') ? '' : (t('demo-tips') + '{style="color: red; font-size: 30px"}\n\n'))

            const idx = str.indexOf('#')
            return str.substring(0, idx) + message + str.substring(idx)
          }

          if (cache[path]) {
            data.data.content = replaceContnet(cache[path])
            return Promise.resolve(data)
          }

          return xFetch(path).then(res => res.text()).then(md => {
            cache[path] = md
            data.data.content = replaceContnet(md)
            return data
          })
        }
      }

      if (uri.startsWith('/api/extensions')) {
        if (method === 'GET') {
          return xFetch('/extensions.json').then(res => res.json()).then(json => {
            return Promise.resolve({ status: 'ok', message: 'success', data: json })
          })
        }
      }

      if (uri.startsWith('/extensions/')) {
        if (method === 'GET') {
          return xFetch(uri).then(x => x.json())
        }
      }

      const message = t('demo-tips')
      useToast().show('warning', message)

      return Promise.resolve({ status: 'error', message })
    },
    text: () => {
      console.log('mock api text >', uri, init)

      const method = (init && init.method) || 'GET'

      if (uri.startsWith('/extensions/')) {
        if (method === 'GET') {
          return xFetch(uri).then(r => r.text())
        }
      }
    },
  } as any)

  window.fetch = (uri: any, init: any) => {
    if (uri.startsWith('https://') || uri.startsWith('http://')) {
      return xFetch(uri, init)
    }

    return fakeFetch(uri, init)
  }

  window.open = function (...args: any[]) {
    const win = xOpen(...args)
    win!.fetch = window.fetch
    return win
  }
}
