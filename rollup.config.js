import {terser} from 'rollup-plugin-terser';

// eslint-disable-next-line import/no-anonymous-default-export -- Rollup config
export default [{
  input: 'index.js',
  output: {
    file: 'dist/json-pull-parser.js',
    format: 'umd',
    sourcemap: true,
    name: 'JSONPullParser'
  },
  plugins: [
    terser()
  ]
}];
