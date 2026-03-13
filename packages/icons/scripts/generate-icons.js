import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { transform } from '@svgr/core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SVG_DIR = path.resolve(__dirname, '../src/svg');
const REACT_DIR = path.resolve(__dirname, '../src/react');
const DIST_SVG_DIR = path.resolve(__dirname, '../dist/svg');

function getComponentName(fileName, category) {
  const name = fileName.replace(/^icon-/, '').replace(/\.svg$/, '');

  const pascal = name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

  if (category === 'food') {
    return `Icon${category.charAt(0).toUpperCase() + category.slice(1)}${pascal}`;
  }

  return `Icon${pascal}`;
}

function getDistSvgName(fileName) {
  return fileName.replace(/^icon-/, '');
}

function getSvgFiles() {
  const result = [];

  const categories = fs.readdirSync(SVG_DIR).filter((name) => {
    return fs.statSync(path.join(SVG_DIR, name)).isDirectory();
  });

  for (const category of categories) {
    const categoryDir = path.join(SVG_DIR, category);
    const files = fs.readdirSync(categoryDir).filter((f) => f.endsWith('.svg'));

    for (const file of files) {
      const filePath = path.join(categoryDir, file);
      const componentName = getComponentName(file, category);
      const distSvgName = getDistSvgName(file);

      result.push({ filePath, category, file, componentName, distSvgName });
    }
  }

  return result;
}

async function transformToReact(svgContent, componentName, category) {
  const isFood = category === 'food';

  const code = await transform(
    svgContent,
    {
      typescript: true,
      dimensions: false,
      svgo: true,
      svgoConfig: {
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                removeViewBox: false,
              },
            },
          },
          { name: 'removeAttrs', params: { attrs: '(aria-hidden|width|height)' } },
          ...(!isFood ? [{ name: 'convertColors', params: { currentColor: true } }] : []),
        ],
      },
      plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
    },
    { componentName }
  );

  // export default -> named export로 변환
  return code
    .replace(/export default \w+;?\n?/, '')
    .replace(`const ${componentName}`, `export const ${componentName}`);
}

async function run() {
  const svgFiles = getSvgFiles();

  fs.mkdirSync(REACT_DIR, { recursive: true });
  fs.mkdirSync(DIST_SVG_DIR, { recursive: true });

  for (const { filePath, category, componentName, distSvgName } of svgFiles) {
    const svgContent = fs.readFileSync(filePath, 'utf-8');

    // React 컴포넌트 변환 후 src/react/ 에 저장
    const code = await transformToReact(svgContent, componentName, category);
    fs.writeFileSync(path.join(REACT_DIR, `${componentName}.tsx`), code, 'utf-8');
    console.log(`✅ ${componentName}.tsx`);

    // 최적화된 SVG를 dist/svg/ 에 복사
    fs.copyFileSync(filePath, path.join(DIST_SVG_DIR, distSvgName));
    console.log(`✅ dist/svg/${distSvgName}`);
  }

  // src/index.ts 자동 생성
  const indexContent = svgFiles
    .map(({ componentName }) => `export { ${componentName} } from "./react/${componentName}";`)
    .join('\n') + '\n';

  fs.writeFileSync(path.resolve(__dirname, '../src/index.ts'), indexContent, 'utf-8');
  console.log('✅ src/index.ts');

  // package.json exports에 SVG 경로 자동 등록
  const pkgPath = path.resolve(__dirname, '../package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

  const svgExports = {};
  for (const { distSvgName } of svgFiles) {
    svgExports[`./${distSvgName}`] = `./dist/svg/${distSvgName}`;
  }

  pkg.exports = {
    '.': pkg.exports['.'],
    './*': pkg.exports['./*'],
    ...svgExports,
  };

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
  console.log('✅ package.json exports');
}

run();
