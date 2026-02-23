import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

const external = ['react', 'react/jsx-runtime', 'react-dom'];

export default [
  // JS 번들 (ESM + CJS)
  {
    input: 'src/index.ts',
    external,
    output: [
      { file: 'dist/index.cjs.js', format: 'cjs' },
      { file: 'dist/index.esm.js', format: 'esm' },
    ],
    plugins: [
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
