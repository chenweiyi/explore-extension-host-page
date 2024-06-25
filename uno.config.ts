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
    ],
    [
      'absolute-y-center',
      {
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)'
      }
    ],
    [
      'box-shadow-sample',
      {
        'box-shadow': 'inset 0 0 4px 4px rgb(50 91 192 / 44%)'
      }
    ],
    [
      'box-shadow-sample-hover',
      {
        'box-shadow': 'inset 0 0 4px 4px rgb(218 226 11 / 81%)'
      }
    ]
  ]
})
