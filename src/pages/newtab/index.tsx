import React from 'react'
import { createRoot } from 'react-dom/client'
import Newtab from '@pages/newtab/Newtab'
import '@pages/newtab/index.css'
import refreshOnUpdate from 'virtual:reload-on-update-in-view'
// import 'virtual:uno.css'
import '@src/assets/style/uno.css'

refreshOnUpdate(['pages/newtab', 'uno.css'])

function init() {
  const appContainer = document.querySelector('#app-container')
  if (!appContainer) {
    throw new Error('Can not find #app-container')
  }
  const root = createRoot(appContainer)

  root.render(<Newtab />)
}

init()
