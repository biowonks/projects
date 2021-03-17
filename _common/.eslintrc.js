/* eslint-disable no-magic-numbers */

'use strict';

const off = 0;
const warn = 1;
const error = 2;

module.exports = {
  env: {
    node: true,
    mocha: true,
    es6: true,
  },
  globals: {
    expect: true,
    expectRejection: true,
    sinon: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    // Possible errors
    'comma-dangle': [warn, 'always-multiline'],
    'no-cond-assign': error,
    'no-console': warn,
    'no-constant-condition': warn,
    'no-control-regex': error,
    'no-debugger': warn,
    'no-dupe-args': error,
    'no-dupe-keys': error,
    'no-duplicate-case': error,
    'no-empty': error,
    'no-empty-character-class': error,
    'no-ex-assign': error,
    'no-extra-boolean-cast': error,
    'no-extra-parens': off,
    'no-extra-semi': error,
    'no-func-assign': error,
    'no-inner-declarations': off,
    'no-invalid-regexp': error,
    'no-irregular-whitespace': error,
    'no-negated-in-lhs': error,
    'no-obj-calls': warn,
    'no-regex-spaces': warn,
    'no-sparse-arrays': error,
    'no-unexpected-multiline': error,
    'no-unreachable': warn,
    'no-unsafe-finally': error,
    'use-isnan': error,
    'valid-jsdoc': [off, {
      prefer: {
        return: 'returns',
      },
      requireParamDescription: false,
      requireReturn: false,
      requireReturnDescription: false,
    }],
    'valid-typeof': error,

    // Best practices
    'accessor-pairs': error,
    'array-callback-return': warn,
    'block-scoped-var': error,
    complexity: off,
    'consistent-return': off,
    curly: [error, 'all'],
    'default-case': off,
    'dot-location': [error, 'property'],
    'dot-notation': warn,
    eqeqeq: [error, 'smart'],
    'guard-for-in': off,
    'no-alert': error,
    'no-caller': error,
    'no-case-declarations': error,
    'no-div-regex': off,
    'no-else-return': error,
    'no-empty-function': off,
    'no-empty-pattern': error,
    'no-eq-null': error,
    'no-eval': warn,
    'no-extend-native': error,
    'no-extra-bind': error,
    'no-extra-label': error,
    'no-fallthrough': off,
    'no-floating-decimal': off,
    'no-implicit-coercion': [error, {allow: ['!!']}],
    'no-implicit-globals': error,
    'no-implied-eval': error,
    'no-invalid-this': error,
    'no-iterator': warn,
    'no-labels': warn,
    'no-lone-blocks': error,
    'no-loop-func': error,
    'no-magic-numbers': [error, {ignore: [-1, 0, 1], ignoreArrayIndexes: true}],
    'no-multi-spaces': error,
    'no-multi-str': warn,
    'no-native-reassign': error,
    'no-new': error,
    'no-new-func': error,
    'no-new-wrappers': error,
    'no-octal': error,
    'no-octal-escape': error,
    'no-param-reassign': warn,
    'no-proto': error,
    'no-redeclare': error,
    'no-return-assign': error,
    'no-script-url': error,
    'no-self-assign': error,
    'no-self-compare': error,
    'no-sequences': error,
    'no-throw-literal': error,
    'no-unmodified-loop-condition': error,
    'no-unused-expressions': error,
    'no-unused-labels': error,
    'no-useless-call': error,
    'no-useless-concat': error,
    'no-useless-escape': error,
    'no-void': error,
    'no-warning-comments': off,
    'no-with': error,
    radix: off,
    'vars-on-top': off,
    'wrap-iife': [error, 'inside'],
    yoda: [error, 'never'],

    // Strict mode
    strict: [error, 'global'],

    // Variables
    'init-declarations': off,
    'no-catch-shadow': off,
    'no-delete-var': error,
    'no-label-var': error,
    'no-restricted-globals': off,
    'no-shadow': error,
    'no-shadow-restricted-names': error,
    'no-undef': error,
    'no-undef-init': error,
    'no-undefined': off,
    'no-unused-vars': [1, {args: 'none'}],		// No arg checking so that function signatures may be preserved
    'no-use-before-define': [error, 'nofunc'],

    // Node specific
    'callback-return': off,
    'global-require': error,
    'handle-callback-err': [error, 'error'],
    'no-mixed-requires': [1, false],
    'no-new-require': error,
    'no-path-concat': error,
    'no-process-env': off,
    'no-process-exit': off,
    'no-restricted-modules': off,
    'no-sync': off,

    // Styling
    'array-bracket-spacing': error,
    'block-spacing': error,
    'brace-style': [error, '1tbs', {allowSingleLine: false}],
    camelcase: [error, {properties: 'never'}],
    'comma-spacing': [error, {before: false, after: true}],
    'comma-style': [error, 'last', {exceptions: {ArrayExpression: true, ObjectExpression: true}}],
    'computed-property-spacing': error,
    'consistent-this': [error, 'self'],
    'eol-last': error,
    'func-names': off,
    'func-style': off,
    'id-blacklist': off,
    'id-length': off,
    'id-match': off,
    indent: [error, 2, {SwitchCase: 1}],
    'jsx-quotes': [error, 'prefer-double'],
    'key-spacing': [error, {beforeColon: false, afterColon: true}],
    'keyword-spacing': [error, {before: true, after: true}],
    'linebreak-style': [error, 'unix'],
    'lines-around-comment': off,
    'max-depth': off,
    'max-len': off,
    'max-nested-callbacks': off,
    'max-params': off,
    'max-statements': off,
    'max-statements-per-line': [error, {max: 1}],
    'new-cap': [error, {newIsCap: true, capIsNew: true}],
    'new-parens': error,
    'newline-after-var': off,
    'newline-before-return': off,
    'newline-per-chained-call': [error, {ignoreChainWithDepth: 2}],
    'no-array-constructor': error,
    'no-bitwise': off,
    'no-continue': off,
    'no-inline-comments': off,
    'no-lonely-if': error,
    'no-mixed-spaces-and-tabs': error,
    'no-multiple-empty-lines': [error, {max: 2}],
    'no-negated-condition': off,
    'no-nested-ternary': error,
    'no-new-object': error,
    'no-plusplus': off,
    'no-restricted-syntax': off,
    'no-spaced-func': error,
    'no-ternary': off,
    'no-trailing-spaces': [error, {skipBlankLines: false}],
    'no-underscore-dangle': off,
    'no-unneeded-ternary': error,
    'no-whitespace-before-property': error,
    'object-curly-spacing': off,
    'one-var': off,
    'one-var-declaration-per-line': [error, 'always'],
    'operator-assignment': error,
    'operator-linebreak': [error, 'after'],
    'padded-blocks': [error, 'never'],
    'quote-props': [error, 'as-needed'],
    quotes: [error, 'single', 'avoid-escape'],
    'require-jsdoc': off,
    semi: [error, 'always'],
    'semi-spacing': [error, {before: false, after: true}],
    'sort-vars': off,
    'space-before-blocks': [error, 'always'],
    'space-before-function-paren': [error, {anonymous: 'never', named: 'never', asyncArrow: 'always'}],
    'space-in-parens': [error, 'never'],
    'space-infix-ops': error,
    'space-unary-ops': [warn, {words: true, nonwords: false}],
    'spaced-comment': [error, 'always', {exceptions: ['-']}],
    'wrap-regex': off,

    // ES6
    'arrow-body-style': off,
    'arrow-parens': [error, 'always'],
    'arrow-spacing': [error, {before: true, after: true}],
    'constructor-super': error,
    'generator-star-spacing': [error, {before: true, after: false}],
    'no-class-assign': error,
    'no-confusing-arrow': [error, {allowParens: true}],
    'no-const-assign': error,
    'no-dupe-class-members': error,
    'no-duplicate-imports': error,
    'no-new-symbol': error,
    'no-restricted-imports': off,
    'no-this-before-super': error,
    'no-useless-computed-key': error,
    'no-useless-constructor': error,
    'no-var': error,
    'object-shorthand': [error, 'properties'],
    'prefer-arrow-callback': off,
    'prefer-const': off,
    'prefer-reflect': off,
    'prefer-rest-params': error,
    'prefer-spread': error,
    'prefer-template': off,
    'require-yield': warn,
    'sort-imports': off,
    'template-curly-spacing': [error, 'never'],
    'yield-star-spacing': [error, {before: true, after: false}],
  },
  overrides: [
    {
      files: ['*.tests.js'],
      rules: {
        'no-magic-numbers': off,
        'no-unused-expressions': off,
      },
    },
  ],
};
