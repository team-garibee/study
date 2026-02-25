import { defineConfig } from 'eslint/config';
import { baseConfig } from './eslint/base.mjs';

export default defineConfig([
  {
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.turbo/**',
      '**/.storybook-static/**',
      '**/node_modules/**',
    ],
  },
  ...baseConfig,
]);
