/**
 * 静态撞名检查：所有 src/ 片段会被拼进同一个作用域，
 * 顶层 const/let/function 重名会让 build 产物直接语法错误。
 *
 *   node tools/lint-names.mjs
 */
import { readdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const dirs = ['src/models', 'src/lessons', 'src/quizzes', 'src/exams'];
const files = [];
for (const dir of dirs) {
  try {
    const entries = await readdir(resolve(root, dir));
    entries.filter((f) => f.endsWith('.js')).forEach((f) => files.push(`${dir}/${f}`));
  } catch (_error) {
    /* 目录不存在 */
  }
}

const declared = new Map(); // name -> [file...]
// 只查 factory 作用域顶层：恰好 4 个空格的缩进（函数体内部更深）
const pattern = /^ {4}(?:const|let|function|class)\s+([A-Za-z_$][\w$]*)/gm;

for (const file of files) {
  const source = await readFile(resolve(root, file), 'utf8');
  let match;
  while ((match = pattern.exec(source))) {
    const name = match[1];
    const list = declared.get(name) || [];
    list.push(file);
    declared.set(name, list);
  }
}

const core = await readFile(resolve(root, 'src/core.js'), 'utf8');
let coreMatch;
while ((coreMatch = pattern.exec(core))) {
  const name = coreMatch[1];
  const list = declared.get(name) || [];
  list.push('src/core.js');
  declared.set(name, list);
}

const dupes = [...declared.entries()].filter(([, list]) => new Set(list).size > 1);
if (dupes.length) {
  console.log(`发现 ${dupes.length} 个重名声明：`);
  dupes.forEach(([name, list]) => console.log(`  ✗ ${name}  ←  ${[...new Set(list)].join(', ')}`));
  process.exit(1);
}
console.log(`✓ ${files.length} 个片段文件，${declared.size} 个顶层声明，无重名`);
