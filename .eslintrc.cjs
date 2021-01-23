'use strict';

module.exports = {
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  extends: [
    'ash-nazg/sauron'
  ],
  env: {
    browser: false,
    es6: true
  },
  settings: {
    polyfills: [
      'Math.trunc',
      'Number.parseFloat',
      'Symbol.iterator'
    ]
  },
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  overrides: [{
    files: ['.eslintrc.cjs'],
    extends: [
      'ash-nazg/sauron-node',
      'plugin:node/recommended-script'
    ],
    rules: {
      'import/no-commonjs': 0
    }
  }, {
    files: ['*.md'],
    globals: {
      json: true,
      token: true,
      JSONPullParser: true
    },
    rules: {
      'import/unambiguous': 0
    }
  }],
  rules: {
    'no-bitwise': 0,
    'unicorn/consistent-destructuring': 0
  }
};
