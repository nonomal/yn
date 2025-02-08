import { defineComponent, h, ref, watchEffect } from 'vue'
import mime from 'mime'
import type { Plugin } from '@fe/context'
import store from '@fe/support/store'
import { getAttachmentURL } from '@fe/services/base'
import { sleep } from '@fe/utils'
import type { Doc } from '@fe/types'

import { isElectron } from '@fe/support/env'

function isMediaFile (doc?: Doc | null): 'video' | 'audio' | false {
  if (!doc) {
    return false
  }

  if (doc.plain) {
    return false
  }

  const fileMime = mime.getType(doc.name)
  if (!fileMime) {
    return false
  }

  if (fileMime.startsWith('video/')) {
    return 'video'
  }

  if (fileMime.startsWith('audio/')) {
    return 'audio'
  }

  return false
}

const MediaPlayer = defineComponent({
  setup () {
    const src = ref('')
    const type = ref<'video' | 'audio' | false>(false)

    watchEffect(async () => {
      const doc = store.state.currentFile
      type.value = false
      src.value = ''
      await sleep(0)

      if (doc) {
        type.value = isMediaFile(doc)

        if (isElectron && doc.absolutePath) {
          src.value = 'file://' + doc.absolutePath
        } else {
          src.value = getAttachmentURL(doc)
        }
      }
    })

    function onLeavepictureinpicture (e: Event) {
      const target = e.target as HTMLMediaElement
      if (!target.isConnected) {
        target.pause()
      }
    }

    return () => src.value ? h(
      'div',
      { style: 'width: 100%; height: 100%; display: flex; align-items: center; justify-content: center' },
      type.value === 'video'
        ? h('video', { src: src.value, controls: true, onLeavepictureinpicture, style: 'width: 100%; height: 100%; object-fit: contain' })
        : type.value === 'audio'
          ? h('audio', { src: src.value, controls: true })
          : ''
    ) : null
  }
})

export default {
  name: 'media-player',
  register: ctx => {
    ctx.editor.registerCustomEditor({
      name: 'image-player',
      displayName: 'Image Viewer',
      hiddenPreview: true,
      when ({ doc }) {
        return !!isMediaFile(doc)
      },
      component: MediaPlayer,
    })

    type XHTMLMediaElement = HTMLMediaElement & { _setAudioPreload?: (isInView: boolean) => void }

    let observer: IntersectionObserver | null = null

    function setAudioPreload (this: XHTMLMediaElement, isInView: boolean) {
      if (isInView && this._setAudioPreload) {
        this.preload = 'metadata'
        delete this._setAudioPreload
        observer?.unobserve(this)
      }
    }

    function cleanObserver () {
      observer?.disconnect()
      observer = null
    }

    ctx.registerHook('VIEW_RENDERED', () => {
      cleanObserver()

      const medias = ctx.view.getViewDom()?.querySelectorAll<HTMLMediaElement>('audio')
      if (medias && medias.length > 0) {
        observer = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            const el = entry.target as XHTMLMediaElement
            el._setAudioPreload?.(entry.isIntersecting)
          })
        })

        medias.forEach((media: XHTMLMediaElement) => {
          if (media.preload === 'none') {
            media._setAudioPreload = ctx.lib.lodash.debounce(setAudioPreload, 400, { leading: false, trailing: true })
            observer!.observe(media)
          }
        })
      }
    })
  }
} as Plugin
