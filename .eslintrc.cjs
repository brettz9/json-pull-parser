'use strict';

module.exports = {
  extends: [
    'ash-nazg/sauron-node'
  ],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
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
    files: 'test/index.js',
    parser: 'babel-eslint',
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module'
    },
    rules: {
      'node/no-unsupported-features/es-syntax': ['error', {
        ignores: ['dynamicImport', 'modules']
      }],
      'no-console': 0
    }
  }, {
    files: '*.html',
    env: {
      browser: true
    },
    globals: {
      JSONPullParser: true
    },
    rules: {
      'import/unambiguous': 0
    }
  }, {
    files: ['*.md'],
    globals: {
      json: true,
      require: true,
      JSONPullParser: true
    },
    rules: {
      'import/no-commonjs': 0,
      'no-shadow': ['error', {
        allow: ['JSONPullParser']
      }],
      'no-unused-vars': ['error', {
        varsIgnorePattern: 'token|JSONPullParser'
      }],
      'node/no-missing-require': ['error', {
        allowModules: ['json-pull-parser']
      }],
      'import/unambiguous': 0
    }
  }],
  rules: {
    'no-bitwise': 0,
    'unicorn/consistent-destructuring': 0
  }
};
