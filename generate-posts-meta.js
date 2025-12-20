import fs from 'fs';
import path from 'path';

const POSTS_DIR = path.resolve('./pictures');
const OUTPUT_FILE = path.resolve('./posts-meta.json');

/**
 * 递归扫描目录，统计文件数量
 * @param {string} dir 当前目录
 * @param {object} result 统计结果容器
 * @returns {number} 当前目录下的文件总数
 */
function scanDir(dir, result) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let count = 0;

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isFile()) {
      count += 1;
    } else if (entry.isDirectory()) {
      count += scanDir(fullPath, result);
    }
  }

  const relativePath = path.relative(POSTS_DIR, dir) || 'root';
  result[relativePath] = count;

  return count;
}

const folders = {};
const total = scanDir(POSTS_DIR, folders);

fs.writeFileSync(
  OUTPUT_FILE,
  JSON.stringify({ total, folders }, null, 2),
  'utf-8'
);

console.log('posts-meta.json generated:', { total, folders });
