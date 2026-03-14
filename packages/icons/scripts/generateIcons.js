/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-console */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { transform } from '@svgr/core';
import jsx from '@svgr/plugin-jsx';
import prettier from '@svgr/plugin-prettier';
import svgo from '@svgr/plugin-svgo';
import { optimize } from 'svgo';
import prettierConfig from '../../../prettier.config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SVG_DIR = path.resolve(__dirname, '../src/svg');
const REACT_DIR = path.resolve(__dirname, '../src/react');
const INDEX_FILE = path.resolve(__dirname, '../src/index.ts');
const DIST_SVG_DIR = path.resolve(__dirname, '../dist/svg');

/** kebab-case → PascalCase 변환 */
const toPascalCase = (str) =>
  str.replace(/(^\w|-\w)/g, (text) => text.replace(/-/, '').toUpperCase());

/** 파일명과 카테고리로 컴포넌트 이름 및 dist SVG 파일명 생성 */
const getIconNames = (file, category) => {
  const isFood = category === 'food';
  const baseName = file.replace('icon-', '').replace('.svg', '');

  return {
    isFood,
    componentName: `Icon${toPascalCase(isFood ? `food-${baseName}` : baseName)}`,
    distSvgName: isFood ? `food-${baseName}.svg` : `${baseName}.svg`,
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
    // 음식 아이콘은 원본 색상 유지, 일반 아이콘은 currentColor로 변환
    ...(isFood
      ? []
      : [{ name: 'convertColors', params: { currentColor: true } }]),
    'removeDimensions',
  ],
});

/** 아이콘 컴포넌트 템플릿 */
const iconTemplate = (variables, { tpl }) => {
  const isFood = variables.componentName.includes('Food');
  const sizeAssignment = `size = ${isFood ? 48 : 24}`;

  return tpl`
import type { SVGProps } from "react";
${'\n'}
export const ${variables.componentName} = ({
  ${sizeAssignment},
  ...props
}: SVGProps<SVGSVGElement> & { size?: number }) => (
  ${variables.jsx}
);
`;
};

/** 메인 실행 함수 */
const generateIcons = async () => {
  try {
    await fs.mkdir(REACT_DIR, { recursive: true });
    await fs.mkdir(DIST_SVG_DIR, { recursive: true });

    const categories = await fs.readdir(SVG_DIR);
    const exportLines = [];

    for (const category of categories) {
      const categoryPath = path.join(SVG_DIR, category);
      if (!(await fs.stat(categoryPath)).isDirectory()) {
        continue;
      }

      const files = (await fs.readdir(categoryPath)).filter((f) =>
        f.endsWith('.svg'),
      );

      for (const file of files) {
        const filePath = path.join(categoryPath, file);
        const svgCode = await fs.readFile(filePath, 'utf8');
        const { isFood, componentName, distSvgName } = getIconNames(
          file,
          category,
        );

        const { data: optimizedSvg } = optimize(svgCode, {
          path: filePath,
          ...getSvgoConfig(isFood),
        });
        await fs.writeFile(path.join(DIST_SVG_DIR, distSvgName), optimizedSvg);
        console.log(`📁 dist/svg/${distSvgName}`);

        const tsxCode = await transform(
          svgCode,
          {
            plugins: [svgo, jsx, prettier],
            typescript: true,
            dimensions: false,
            jsxRuntime: 'automatic',
            exportType: 'named',
            template: iconTemplate,
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
        await fs.writeFile(
          path.join(REACT_DIR, `${componentName}.tsx`),
          tsxCode,
        );
        console.log(`✅ ${componentName}.tsx`);

        exportLines.push(
          `export { ${componentName} } from './react/${componentName}';`,
        );
      }
    }

    await fs.writeFile(INDEX_FILE, exportLines.join('\n') + '\n');
    console.log('📝 src/index.ts 업데이트 완료');

    console.log('🎉 모든 아이콘이 성공적으로 생성되었습니다!');
  } catch (error) {
    console.error('❌ 아이콘 생성 중 에러 발생:', error);
    process.exit(1);
  }
};

generateIcons();
