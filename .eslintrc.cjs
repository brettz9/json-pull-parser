'use strict';

module.exports = {
  extends: [
    'ash-nazg/sauron-node-overrides'
  ],
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false,
    ecmaVersion: 2020
  },
  env: {
    es6: true
  },
  settings: {
    polyfills: [
      'Math.trunc',
      'Number.parseFloat',
      'Symbol.iterator'
    ]
  },
  overrides: [{
    files: '*.cjs',
    extends: ['ash-nazg/sauron-node-script-overrides'],
    rules: {
      // Internal use
      'node/shebang': 'off'
    }
  }, {
    files: 'test/index.js',
    parser: '@babel/eslint-parser',
    parserOptions: {
      requireConfigFile: false,
      ecmaVersion: 2020,
      sourceType: 'module'
    },
    rules: {
      'no-shadow': ['error', {allow: ['assert']}],
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
    files: ['*.md/*.js'],
    globals: {
      json: true,
      require: true,
      JSONPullParser: true
    },
    rules: {
      'import/no-commonjs': 0,
      'import/unambiguous': 0,
      'no-shadow': ['error', {
        allow: ['JSONPullParser']
      }],
      'no-unused-vars': ['error', {
        varsIgnorePattern: 'token|JSONPullParser'
      }],
      'node/no-missing-require': ['error', {
        allowModules: ['json-pull-parser']
      }]
    }
  }],
  rules: {
    'no-bitwise': 0,
    'unicorn/consistent-destructuring': 0
  }
};
