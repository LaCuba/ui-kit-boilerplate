import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'

export function getFile(dir: string, filePath: string) {
  const path = resolve(dir, filePath)
  return JSON.parse(readFileSync(path, 'utf-8'))
}

export function getFileNameAndExtension(path: string) {
  const fileName = path.split('\\').pop()
  const extension = fileName?.split('.')?.pop()

  return { fileName, extension }
}

export function getSmileExt(ext: string) {
  switch (ext) {
    case 'TS':
    case 'TSX':
      return '🛡️'
    case 'JS':
    case 'JSX':
      return '🟨'
    case 'SCSS':
    case 'CSS':
      return '🎨'
    default:
      return ''
  }
}
