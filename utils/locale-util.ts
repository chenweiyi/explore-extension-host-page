export const t = (...args: [string, ...string[]]) => {
  const res = chrome.i18n.getMessage(...args)
  console.log(args[0], res)
  return res
}
