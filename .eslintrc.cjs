module.exports = {
  extends: [
    'standard',
  ],
  ignorePatterns: [
    'dist',
    'docs',
  ],
  rules: {
    'keyword-spacing': ['error', {
      before: true,
      after: true,
      overrides: {
        if: { after: false },
        for: { after: false },
        while: { after: false },
        switch: { after: false },
      },
    }],
    'space-in-parens': ['off'],
    'space-before-function-paren': ['off'],
    'comma-dangle': ['error', {
      arrays: 'always-multiline',
      objects: 'always-multiline',
      imports: 'always-multiline',
      exports: 'always-multiline',
      functions: 'ignore',
    }],
    'no-debugger': ['warn'],
  },
  globals: {
    AudioContext: 'readonly',
  },
}
