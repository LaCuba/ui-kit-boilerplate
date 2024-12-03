import { resolve } from 'node:path'

import fastGlob from 'fast-glob'
import type { Plugin, RollupOptions } from 'rollup'
import esbuild from 'rollup-plugin-esbuild'
import postcss from 'rollup-plugin-postcss'

import alias, { type Alias } from '@rollup/plugin-alias'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser';

import { getFile } from './helpers'

interface Options {
  dir: string
  aliases: Alias[]
}

export async function getConfig(options: Options): Promise<RollupOptions> {
  const { dir, aliases } = options

  const packageJson = getFile(dir, 'package.json')

  const plugins: Plugin[] = [
    postcss(),
    nodeResolve({ extensions: ['.ts', '.tsx', '.js', '.jsx'] }),
    alias({ entries: aliases }),
    esbuild({
      tsconfig: resolve(dir, 'tsconfig.json'),
    }),
    {
      name: '@rollup-plugin/remove-empty-chunks',
      generateBundle(_, bundle) {
        for (const [name, chunk] of Object.entries(bundle)) {
          if (chunk.type === 'chunk' && chunk.code.length === 0) {
            delete bundle[name]
          }
        }
      },
    },
    terser()
  ]

  const deps = [
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.peerDependencies ?? {}),
  ]

  const external = deps.length ? new RegExp(`^(${deps.join('|')})`) : undefined
  const entries = await fastGlob('src/**/*.{ts,tsx,scss}')

  const outputs: RollupOptions['output'] = [
    {
      format: 'es',
      exports: 'named',
      entryFileNames: '[name].js',
      dir: resolve(dir, 'dist'),
      preserveModules: true,
      preserveModulesRoot: 'src',
      globals: { react: 'React' },
    },
  ]

  return {
    input: entries,
    onLog(level, log, handler) {
      if (log.code === 'EMPTY_BUNDLE') return
      return handler(level, log)
    },
    onwarn(warning, warn) {
      if (warning.code === 'SOURCEMAP_ERROR') return
      if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return
      warn(warning)
    },
    output: outputs,
    external,
    plugins,
  }
}
