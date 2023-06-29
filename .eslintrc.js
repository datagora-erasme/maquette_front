module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: [
    'plugin:vue/recommended',
  ],
  // plugins: ['prettier'],
  // add your custom rules here
  rules: {
    // Eslint global override
    'space-before-function-paren': ['error', 'never'],
    'object-curly-spacing': ['error', 'always'],
    'comma-dangle': ['error', 'only-multiline'],
    'no-unused-vars': 'warn',
    'no-console': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // Custom rules
    // https://eslint.org/docs/rules/semi
    // semi: ['error', 'never'],
    // https://eslint.vuejs.org/rules/html-self-closing.html#vue-html-self-closing
    // 'vue/html-self-closing': [
    //   'error',
    //   {
    //     html: {
    //       void: 'always',
    //       normal: 'always',
    //       component: 'always',
    //     },
    //   },
    // ],
    // https://eslint.vuejs.org/rules/component-name-in-template-casing.html#vue-component-name-in-template-casing
    // 'vue/component-name-in-template-casing': ['error', 'PascalCase'],
    // https://eslint.org/docs/rules/quotes
    quotes: ['error', 'single', { avoidEscape: true }],
    // https://eslint.vuejs.org/rules/valid-v-slot.html#vue-valid-v-slot
    'vue/valid-v-slot': ['error', { allowModifiers: true }],
    // https://eslint.vuejs.org/rules/html-indent.html#vue-html-indent
    'vue/html-indent': [
      'error',
      2,
      {
        alignAttributesVertically: false,
        attribute: 1,
        baseIndent: 1,
        closeBracket: 0,
        ignores: [],
      },
    ],
    // https://eslint.vuejs.org/rules/singleline-html-element-content-newline.html#vue-singleline-html-element-content-newline
    'vue/singleline-html-element-content-newline': [
      'error',
      {
        ignoreWhenNoAttributes: true,
        ignoreWhenEmpty: true,
      },
    ],
    'vue/max-attributes-per-line': ['error', {
      singleline: {
        max: 3
      },
    }]
  },
  globals: {
    $nuxt: true,
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
}
