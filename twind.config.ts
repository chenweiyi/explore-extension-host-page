import { defineConfig } from '@twind/core'
import presetTailwind from '@twind/preset-tailwind'
import presetAutoprefix from '@twind/preset-autoprefix'

export default defineConfig({
  presets: [presetAutoprefix(), presetTailwind()],
  theme: {
    extend: {
      boxShadow: {
        normal: '2px 2px 6px rgba(0,0,0,.5)',
        active: '4px 4px 8px rgba(0,0,0,0.8)'
      }
    }
  }
})
