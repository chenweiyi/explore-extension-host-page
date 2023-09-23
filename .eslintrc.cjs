module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true
  },
  extends: [
    './.eslintrc-auto-import.json',
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['react', '@typescript-eslint'],
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/jsx-no-undef': 'off'
  },
  globals: {
    chrome: 'readonly'
  },
  ignorePatterns: ['watch.js', 'dist/**']
}
