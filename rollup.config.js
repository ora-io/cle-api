import { builtinModules } from 'node:module'
import path from 'node:path'
import esbuild from 'rollup-plugin-esbuild'
// import { dts } from 'rollup-plugin-dts'
// import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { defineConfig } from 'rollup'

const input = path.join(__dirname, './index.js')

const external = [
  ...builtinModules,
  'ethers',
  'bn.js',
  'js-yaml',
  '@hyperoracle/zkwasm-service-helper',
  'web3-eth-contract',
  'semver',
  'axios',
  'form-data',
  '@ethereumjs/rlp'
]

const plugins = [
  json(),
  // nodeResolve({
  //   preferBuiltins: false,
  //   bowser: true
  // }),
  commonjs(),
]

export default () => defineConfig([
  {
    input,
    output: {
      dir: 'dist',
      format: 'esm',
      entryFileNames: '[name].mjs',
    },
    external,
    plugins: [
      ...plugins,
      esbuild.default({
        target: 'node14',
        define: {
          __BROWSER__: 'false'
        },
      }),
    ],
  },
  {
    input,
    output: {
      dir: 'dist',
      format: 'cjs',
      entryFileNames: '[name].cjs',
    },
    external,
    plugins: [
      ...plugins,
      esbuild.default({
        target: 'node14',
        define: {
          __BROWSER__: 'false'
        },
      }),
    ],
  },
  {
    input,
    output: {
      dir: 'dist',
      format: 'esm',
      entryFileNames: '[name].browser.mjs',
    },
    external,
    plugins: [
      ...plugins,
      esbuild.default({
        target: 'node14',
        define: {
          __BROWSER__: 'true'
        },
      }),
    ],
  },
  {
    input,
    output: {
      dir: 'dist',
      format: 'cjs',
      entryFileNames: '[name].browser.cjs',
    },
    external,
    plugins: [
      ...plugins,
      esbuild.default({
        target: 'node14',
        define: {
          __BROWSER__: 'true'
        },
      }),
    ],
  },
  // {
  //   input,
  //   output: {
  //     dir: 'dist',
  //     entryFileNames: 'index.d.ts',
  //     format: 'esm',
  //   },
  //   external,
  //   plugins: [
  //     dts({ respectExternal: true }),
  //   ],
  // },
])
