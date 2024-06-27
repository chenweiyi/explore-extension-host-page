import type { PluginOption } from 'vite'
import { resolve } from 'path'
import { readFiles } from '../fs-util'

const rootDir = resolve(__dirname, '..', '..')
const manifestFile = resolve(rootDir, 'manifest.ts')
const viteConfigFile = resolve(rootDir, 'vite.config.ts')
const locales = resolve(rootDir, 'public/_locales')

export default function watchRebuild(): PluginOption {
  return {
    name: 'watch-rebuild',
    async buildStart() {
      this.addWatchFile(manifestFile)
      this.addWatchFile(viteConfigFile)
      try {
        readFiles(locales).forEach((f) => {
          // console.log('watching locales:', f)
          this.addWatchFile(f)
        })
      } catch (e) {
        console.error(e)
      }
    }
  }
}
