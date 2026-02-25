import { defineConfig } from 'eslint/config';
import { baseConfig } from './eslint/base.mjs';
import { reactBaseConfig } from './eslint/reactBase.mjs';

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
  {
    ...reactBaseConfig,
    files: ['packages/ui/**/*.{tsx,jsx}', 'packages/icons/**/*.{tsx,jsx}'],
  },
]);
