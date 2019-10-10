module.exports =  {
    parser:  '@typescript-eslint/parser',  // Specifies the ESLint parser
    extends:  [
    'plugin:@typescript-eslint/recommended',  // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    'prettier/@typescript-eslint',  // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
    'plugin:prettier/recommended',  // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
    parserOptions:  {
    ecmaVersion:  2018,  // Allows for the parsing of modern ECMAScript features
    sourceType:  'module',  // Allows for the use of imports
  },
    rules:  {
      // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
      // e.g. "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-var-requires" : 0,
      "@typescript-eslint/no-unused-vars" : 0,
      "@typescript-eslint/no-explicit-any": 0,
      "@typescript-eslint/no-parameter-properties": 0,
      "@typescript-eslint/camelcase" : 0,
      "@typescript-eslint/explicit-function-return-type": 0,
      "@typescript-eslint/no-namespace": 0,
      "@typescript-eslint/no-use-before-define": 0,
      "@typescript-eslint/explicit-member-accessibility": 0
    }
};