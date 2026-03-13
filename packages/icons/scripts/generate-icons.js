import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SVG_DIR = path.resolve(__dirname, '../src/svg');

function getCategory(filePath) {
  return path.basename(path.dirname(filePath));
}

function getComponentName(fileName, category) {
  // icon-korean.svg -> korean, icon-arrow-right.svg -> arrow-right
  const name = fileName.replace(/^icon-/, '').replace(/\.svg$/, '');

  // kebab-case -> PascalCase
  const pascal = name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

  // food -> IconFoodKorean, basic -> IconTrash
  if (category === 'food') {
    return `Icon${category.charAt(0).toUpperCase() + category.slice(1)}${pascal}`;
  }

  return `Icon${pascal}`;
}

function getDistSvgName(fileName) {
  // icon-korean.svg -> korean.svg
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

const svgFiles = getSvgFiles();
console.log(svgFiles);
