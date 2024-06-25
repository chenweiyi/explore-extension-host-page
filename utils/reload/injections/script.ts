import initReloadClient from '../initReloadClient'

export default function addHmrIntoScript(watchPath: string | string[]) {
  initReloadClient({
    watchPath,
    onUpdate: () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      chrome.runtime.reload()
    }
  })
}
