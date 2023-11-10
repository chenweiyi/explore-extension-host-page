import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import AdmZip from 'adm-zip'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function readPackageVersion() {
  const data = fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')

  const packageData = JSON.parse(data)
  return packageData
}

const zipFolder = (folderPath, zipPath) => {
  const zip = new AdmZip()
  addFolderToZip(zip, folderPath, '')

  zip.writeZip(zipPath)
  console.log(`Folder ${folderPath} compressed to ${zipPath}`)
}

const addFolderToZip = (zip, folderPath, zipPath) => {
  const files = fs.readdirSync(folderPath)

  files.forEach((fileName) => {
    const filePath = `${folderPath}/${fileName}`
    const stat = fs.lstatSync(filePath)

    if (stat.isDirectory()) {
      addFolderToZip(zip, filePath, `${zipPath}/${fileName}`)
    } else {
      zip.addLocalFile(filePath, zipPath)
    }
  })
}
const packageData = readPackageVersion()
// 压缩文件夹的路径和生成的ZIP文件的路径
const folderPath = path.join(__dirname, '../dist')
const zipPath = path.join(
  __dirname,
  `../explore-extension-host-page_v${packageData.version}.zip`
)

zipFolder(folderPath, zipPath)
