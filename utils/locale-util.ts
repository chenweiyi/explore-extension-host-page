export const t = (...args) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const res = chrome.i18n.getMessage(...args)
  console.log(args[0], res)
  return res
}

export const getLanguage = () => {
  return chrome.i18n.getUILanguage()
}
