import { readdirSync, statSync } from 'fs'
import { join } from 'path'
export const readFiles = (dir: string) => {
  const arr: string[] = []
  const read = (dir: string) => {
    const files = readdirSync(dir)
    files.forEach((file) => {
      const filePath = join(dir, file)
      const stats = statSync(filePath)
      if (stats.isDirectory()) {
        read(filePath) // 递归处理子目录
      } else {
        arr.push(filePath)
      }
    })
  }

  read(dir)
  return arr
}
