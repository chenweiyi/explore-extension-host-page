import { defineConfig, presetUno, presetAttributify } from 'unocss'

export default defineConfig({
  presets: [presetUno(), presetAttributify()],
  rules: [
    [
      'custom-ellipsis',
      {
        overflow: 'hidden',
        'text-overflow': 'ellipsis',
        'white-space': 'nowrap'
      }
    ]
  ]
})
