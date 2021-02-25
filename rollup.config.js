import {terser} from 'rollup-plugin-terser';

export default [{
  input: 'index.js',
  output: {
    file: 'dist/json-pull-parser.cjs',
    format: 'umd',
    sourcemap: true,
    name: 'JSONPullParser'
  },
  plugins: [
    terser()
  ]
}, {
  input: 'index.js',
  output: {
    file: 'dist/json-pull-parser.js',
    format: 'esm',
    sourcemap: true,
    name: 'JSONPullParser'
  },
  plugins: [
    terser()
  ]
}];
