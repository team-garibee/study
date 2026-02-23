import path from 'path';
import { fileURLToPath } from 'url';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import postcss from 'rollup-plugin-postcss';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const external = [
  'react',
  'react/jsx-runtime',
  'react-dom',
  '@mumukji/tokens',
  '@mumukji/icons',
];

export default [
  // JS 번들 (ESM + CJS) + SCSS → CSS 추출
  {
    input: 'src/index.ts',
    external,
    output: [
      { file: 'dist/index.cjs.js', format: 'cjs' },
      { file: 'dist/index.esm.js', format: 'esm' },
    ],
    plugins: [
      postcss({
        extract: path.resolve(__dirname, 'dist/index.css'),
        use: ['sass'],
      }),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'dist/types',
        emitDeclarationOnly: false,
      }),
    ],
  },
  // 타입 번들 (.d.ts)
  {
    input: 'dist/types/index.d.ts',
    output: { file: 'dist/index.d.ts', format: 'esm' },
    plugins: [dts()],
  },
];
