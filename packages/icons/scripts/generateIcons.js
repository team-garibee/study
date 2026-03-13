/* eslint-disable @typescript-eslint/naming-convention */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { transform } from '@svgr/core';
import jsx from '@svgr/plugin-jsx';
import prettier from '@svgr/plugin-prettier';
import svgo from '@svgr/plugin-svgo';
import { optimize } from 'svgo';
import prettierConfig from '../../../prettier.config.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SVG_DIR = path.resolve(__dirname, '../src/svg');
const REACT_DIR = path.resolve(__dirname, '../src/react');
const INDEX_FILE = path.resolve(__dirname, '../src/index.ts');
const DIST_SVG_DIR = path.resolve(__dirname, '../dist/svg');

/** 파일명 형식 변환 유틸 */
const toPascalCase = (str) => {
  return str.replace(/(^\w|-\w)/g, (text) =>
    text.replace(/-/, '').toUpperCase(),
  );
};

/** 파일명 생성 유틸 함수 */
const getIconNames = (file, category) => {
  const isFood = category === 'food';

  const baseName = file.replace('icon-', '').replace('.svg', '');

  const optimizedFileName = isFood ? `food-${baseName}.svg` : `${baseName}.svg`;

  const componentNameBase = isFood ? `food-${baseName}` : baseName;
  const componentName = `Icon${toPascalCase(componentNameBase)}`;

  return {
    isFood,
    optimizedFileName,
    componentName,
  };
};

/** SVGO 공용 설정 */
const getSvgoConfig = (isFood) => ({
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          convertPathData: { floatPrecision: 3 },
          convertShapeToPath: true,
          mergePaths: true,
        },
      },
    },
    ...(isFood
      ? []
      : [{ name: 'convertColors', params: { currentColor: true } }]),
    'removeViewBox',
    'removeDimensions',
  ],
});

/** 아이콘 변환 템플릿 */
const iconTemplate = (variables, { tpl }) => {
  const isFood = variables.componentName.includes('Food');
  const defaultSize = isFood ? 48 : 24;
  const sizeAssignment = `size = ${defaultSize}`;

  return tpl`
import type { SVGProps } from "react";
${'\n'}
export const ${variables.componentName} = ({ 
  ${sizeAssignment}, 
  ...props 
}: SVGProps<SVGSVGElement> & { size?: number; }) => (
  ${variables.jsx}
);
`;
};

/** React 컴포넌트 변환 */
const transformReact = async (svgCode, componentName, category) => {
  const isFood = category === 'food';

  return await transform(
    svgCode,
    {
      plugins: [svgo, jsx, prettier],
      dimensions: false,
      icon: false,
      typescript: true,
      template: iconTemplate,
      jsxRuntime: 'automatic',
      exportType: 'named',
      prettierConfig: { ...prettierConfig },
      svgoConfig: getSvgoConfig(isFood),
      svgProps: {
        width: '{size}',
        height: '{size}',
        'aria-hidden': 'true',
        focusable: 'false',
      },
    },
    { componentName },
  );
};

/** 메인 실행 함수 */
const generateIcons = async () => {
  try {
    await fs.mkdir(REACT_DIR, { recursive: true });
    await fs.mkdir(DIST_SVG_DIR, { recursive: true });
    const categories = await fs.readdir(SVG_DIR);
    let indexContent = '';

    for (const category of categories) {
      const categoryPath = path.join(SVG_DIR, category);
      const stat = await fs.stat(categoryPath);
      if (!stat.isDirectory()) {
        continue;
      }

      const files = await fs.readdir(categoryPath);

      for (const file of files) {
        if (!file.endsWith('.svg')) {
          continue;
        }

        const filePath = path.join(categoryPath, file);
        const svgCode = await fs.readFile(filePath, 'utf8');

        const { isFood, optimizedFileName, componentName } = getIconNames(
          file,
          category,
        );

        // 최적화된 SVG dist에 저장
        const { data: optimizedSvg } = optimize(svgCode, {
          path: filePath,
          ...getSvgoConfig(isFood),
        });
        await fs.writeFile(
          path.join(DIST_SVG_DIR, optimizedFileName),
          optimizedSvg,
        );

        // 리액트 컴포넌트 변환 및 src에 저장
        const jsCode = await transformReact(svgCode, componentName, category);
        await fs.writeFile(
          path.join(REACT_DIR, `${componentName}.tsx`),
          jsCode,
        );

        indexContent += `export { ${componentName} } from './react/${componentName}';\n`;
      }
    }

    await fs.writeFile(INDEX_FILE, indexContent);
    console.log('✅ 모든 아이콘이 성공적으로 생성되었습니다!');
  } catch (error) {
    console.error('❌ 아이콘 생성 중 에러 발생:', error);
    process.exit(1);
  }
};

generateIcons();
