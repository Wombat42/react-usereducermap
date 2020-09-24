import { terser } from 'rollup-plugin-terser';
import babel from '@rollup/plugin-babel';
//import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';

export default {
  input: `src/usereducermap.js`,
  plugins: [commonjs(), terser()],
  output: [
    {
      file: pkg.main,
      format: `cjs`,
    },
    {
      name: 'usereducermap',
      file: 'dist/umd.js',
      format: `umd`,
    },
  ],
};
