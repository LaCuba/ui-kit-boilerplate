import { rmSync } from 'node:fs'
import { join } from 'node:path/posix'

import * as rollup from 'rollup'

import type { Alias } from '@rollup/plugin-alias'

import { getConfig } from './config'
import { getFileNameAndExtension, getSmileExt } from './helpers'
import { generateTypes } from './types'

type BuildOptions = {
  dir: string
  name: string
  isWatch?: boolean
  isClean?: boolean
  isDts?: boolean
  aliases?: Alias[]
}

export async function buildProject(options: BuildOptions) {
  const { dir, name, isWatch, isClean, isDts, aliases = [] } = options

  console.log(`[${name}]🔧 Building...`)

  if (isClean) {
    const distDir = join(dir, 'dist')
    rmSync(distDir, { recursive: true, force: true })
  }

  const config = await getConfig({ dir, aliases })
  console.log('config --------------------------->',config)
  if (isWatch) {
    config.watch = {
      include: config.input as string[],
      chokidar: { ignoreInitial: true },
    }

    const watcher = rollup.watch(config)
    console.log(`[${name}][JS]👀 Watching source files...`)
    reBuild(name, watcher, dir, isDts)
  } else {
    try {
      const build = await rollup.rollup(config)
      const outputs: rollup.OutputOptions[] = Array.isArray(config.output)
        ? config.output
        : [config.output!]

      await Promise.all(outputs.map((output) => build.write(output)))

      console.log(`[${name}][JS]🟨 Generated ESM files ✅`)

      if (isDts) {
        await generateTypes(dir)
        console.log(`[${name}][DTS]🛡️ Generated type definitions ✅`)
      }
    } catch (error) {
      console.log(error)
      process.exit(1)
    }
  }
}

function reBuild(
  name: string,
  watcher: rollup.RollupWatcher,
  dir: string,
  isDts?: boolean,
) {
  let ext = ''
  let countRebuild = 0

  watcher.on('change', (id) => {
    const { extension, fileName } = getFileNameAndExtension(id)
    ext = extension?.toLocaleUpperCase() ?? ''
    const smileExt = getSmileExt(ext)
    console.log(
      `[${name}][${ext}]${smileExt} File: (${fileName}) 🔄 changed, rebuilding...`,
    )
    countRebuild++
  })

  watcher.on('event', async (props) => {
    if (countRebuild > 0 && props.code === 'END') {
      console.log(`[${name}][JS]🟨 Generated ESM files ✅`)
      if (isDts && (ext === 'TS' || ext === 'TSX')) {
        await generateTypes(dir)
        console.log(`[${name}][DTS]🛡️ Generated type definitions ✅`)
      }
    }
  })
}
