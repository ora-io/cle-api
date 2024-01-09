import { builtinModules } from 'node:module'
import path from 'node:path'
import esbuild from 'rollup-plugin-esbuild'
import { dts } from 'rollup-plugin-dts'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import strip from '@rollup/plugin-strip'
import { defineConfig } from 'rollup'

const input = path.join(__dirname, './src/index.ts')

const external = [
  ...builtinModules,
  'ethers',
  'bn.js',
  'js-yaml',
  'web3-eth-contract',
  'semver',
  'axios',
  'form-data',
  '@ethereumjs/rlp',
  'ts-md5',
  'bn.js',
  'yargs',
  'binaryen',
  'assemblyscript',
]

const plugins = [
  json(),
  strip(),
  nodeResolve({
    preferBuiltins: false,
    modulesOnly: true,
    resolveOnly: ['@hyperoracle/zkwasm-service-helper'],
  }),
  commonjs(),
]

const nodePlugins = [
  ...plugins,
  esbuild.default({
    target: 'node14',
    define: {
      __BROWSER__: 'false',
    },
  }),
]

const browserPlugins = [
  ...plugins,
  esbuild.default({
    target: 'node14',
    define: {
      __BROWSER__: 'true',
    },
  }),
]

const commonConfig = {
  input,
  external,
  treeshake: 'smallest',
}

const outputs = env => [{
  dir: 'dist',
  format: 'esm',
  entryFileNames: `[name]${env ? `.${env}` : ''}.mjs`,
}, {
  dir: 'dist',
  format: 'cjs',
  entryFileNames: `[name]${env ? `.${env}` : ''}.cjs`,
}]

export default () => defineConfig([
  {
    ...commonConfig,
    output: outputs(),
    plugins: [
      ...nodePlugins,
    ],
  },
  {
    ...commonConfig,
    output: outputs('browser'),
    plugins: [
      ...browserPlugins,
    ],
  },
  {
    input,
    output: {
      dir: 'dist',
      entryFileNames: '[name].d.ts',
      format: 'esm',
    },
    external,
    plugins: [
      dts({ respectExternal: true }),
    ],
  },
  {
    input,
    output: {
      dir: 'dist',
      entryFileNames: '[name].browser.d.ts',
      format: 'esm',
    },
    external,
    treeshake: 'smallest',
    plugins: [
      esbuild.default({
        target: 'node14',
        define: {
          __BROWSER__: 'true',
        },
      }),
      dts({ respectExternal: true }),
    ],
  },
])
