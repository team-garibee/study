import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import prettierConfig from 'eslint-config-prettier';

export default [
  // 빌드 결과물과 자동 생성 타입 선언 파일은 ESLint 검사에서 제외하도록
  {
    ignores: ['**/dist/**', '**/*.d.ts'],
  },

  // [ 모든 패키지 공통 규칙 ]
  js.configs.recommended, // 기본 JS 규칙
  ...tseslint.configs.strict, // TS 엄격 규칙

  // 커스텀 공통 규칙
  {
    files: ['packages/**/*.{ts,tsx}'],
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error', // import type 구문 강제
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' }, // _로 시작하는 인자는 미사용이어도 허용
      ],
      '@typescript-eslint/no-non-null-assertion': 'warn', // ! 단언 연산자 남용 경고

      // import, export 순서 정렬
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'no-console': 'warn',
      eqeqeq: 'error',
    },
  },

  // React 패키지 전용 규칙 (icons, ui)
  {
    files: ['packages/icons/**/*.{ts,tsx}', 'packages/ui/**/*.{ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    settings: {
      react: {
        version: 'detect', // 설치된 React 버전 자동 감지
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off', // React 17+ 새 JSX transform으로 import 불필요
      'react/prop-types': 'off', // TypeScript가 prop 타입을 대체하므로 불필요
      'react/display-name': 'warn', // 컴포넌트 displayName 누락 경고 (디버깅 편의)
      'react/self-closing-comp': 'warn', // 자식 없는 컴포넌트는 <Foo /> 형태로 통일
      'react/jsx-key': 'error', // .map() 등 반복 렌더링 시 key prop 필수
      'react/jsx-pascal-case': 'error', // 컴포넌트명은 PascalCase 강제
      'react-hooks/rules-of-hooks': 'error', // Hooks는 컴포넌트/커스텀훅 최상위에서만 호출
      'react-hooks/exhaustive-deps': 'warn', // useEffect 등의 deps 배열 누락 경고
    },
  },
  prettierConfig,
];
