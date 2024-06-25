import React from 'react'
import { createRoot } from 'react-dom/client'
import Options from '@pages/options/Options'
import '@pages/options/index.css'
import refreshOnUpdate from 'virtual:reload-on-update-in-view'
// import { attachTwindStyle } from '@src/shared/style/twind'
// import 'virtual:uno.css'
import '@src/assets/style/uno.css'

refreshOnUpdate('pages/options')

function init() {
  const appContainer = document.querySelector('#app-container')
  if (!appContainer) {
    throw new Error('Can not find #app-container')
  }
  // attachTwindStyle(appContainer, document)
  const root = createRoot(appContainer)
  root.render(<Options />)
}

init()
