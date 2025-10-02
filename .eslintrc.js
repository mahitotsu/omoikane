module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'prettier', // Prettierとの競合を避けるため最後に配置
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  env: {
    node: true,
    es2022: true,
  },
  rules: {
    // TypeScript推奨ルール（基本的なもののみ）
    'no-unused-vars': 'off', // TypeScriptで管理
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

    // 一般的なコード品質ルール
    'no-console': 'off', // スクリプトでconsole.logを使用するため
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',
  },
  overrides: [
    {
      // スクリプトファイル用の設定
      files: ['scripts/**/*.ts'],
      rules: {
        'no-console': 'off',
      },
    },
    {
      // 設定ファイル用
      files: ['*.config.js', '.eslintrc.js'],
      env: {
        node: true,
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
  ignorePatterns: ['dist/', 'node_modules/'],
};
