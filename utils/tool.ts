/**
 * 适用于github base64加密
 * @param str
 * @returns
 */
export const utf8_to_base64 = (str: string) => {
  return window.btoa(unescape(encodeURIComponent(str)))
}

/**
 * 适用于github base64解密
 * @param {string} str
 * @returns
 */
export const base64_to_utf8 = (str: string) => {
  return decodeURIComponent(escape(window.atob(str)))
}

export const toUnicode = (str) => {
  return escape(str).replace(/%u/gi, '\\u')
}

export function getTextWidth(text: string, font: string, offset = 10) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  context!.font = font
  const width = context!.measureText(text).width
  return width + offset
}
