import reloadOnUpdate from 'virtual:reload-on-update-in-background-script'

reloadOnUpdate('pages/background')

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
// reloadOnUpdate('pages/content/style.scss')

console.log('background loaded')

chrome.storage.onChanged.addListener((changes, namespace) => {
  console.log('changes', changes)
  // 向激活标签页发送消息
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    for (let i = 0; i < tabs.length; i++) {
      chrome.tabs.sendMessage(tabs[i].id, {
        action: 'settingUpdate',
        data: {
          changes,
          namespace
        }
      })
    }
  })
})
