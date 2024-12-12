import { buildProject } from './build'
import { getFile } from './helpers'

async function start() {
  try {
    const cwd = process.cwd()
    const flags = process.argv.slice(2)
    const isWatch = flags.includes('--watch')
    const isClean = flags.includes('--clean')
    const isDts = flags.includes('--dts')

    const packageJson = getFile(cwd, 'package.json')

    await buildProject({
      dir: cwd,
      name: packageJson.name,
      isWatch,
      isClean,
      isDts,
    })
  } catch (err: any) {
    console.error('Ошибка:', err.message)
    process.exit(1)
  }
}

start()
