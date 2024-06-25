import { defineConfig, presetUno, presetAttributify } from 'unocss'

export default defineConfig({
  cli: {
    entry: {
      patterns: ['./src/**/*.{vue,jsx,tsx,md,mdx,html}'],
      outFile: 'src/assets/style/uno.css'
    }
  },
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
        'box-shadow': 'inset 0 0 2px 2px rgb(208 203 215 / 40%)'
      }
    ],
    [
      'box-shadow-sample-hover',
      {
        'box-shadow': 'inset 0 0 3px 3px rgb(208 203 215 / 80%)'
      }
    ]
  ]
})
