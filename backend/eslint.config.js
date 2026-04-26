import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    rules: {
      semi: 'error',
      'prefer-const': 'error',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
]);
