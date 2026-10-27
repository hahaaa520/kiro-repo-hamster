/* 把路演 deck 打包成单文件 HTML：内联仓鼠 SVG 与所有图片 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(dir, '代码仓鼠-路演.html');
const deliver = path.join(dir, '..', 'deliver');
fs.mkdirSync(deliver, { recursive: true });

let html = fs.readFileSync(src, 'utf8');

const hamster = fs.readFileSync(path.join(dir, 'assets', 'hamster.js'), 'utf8');
html = html.replace('<script src="assets/hamster.js"></script>', '<script>\n' + hamster + '\n</script>');

let inlined = 0;
html = html.replace(/src="(shots\/[^"]+\.png)"/g, (m, rel) => {
  const file = path.join(dir, rel);
  if (!fs.existsSync(file)) throw new Error('missing ' + file);
  const b64 = fs.readFileSync(file).toString('base64');
  inlined++;
  return 'src="data:image/png;base64,' + b64 + '"';
});

const out = path.join(deliver, '代码仓鼠-路演.html');
fs.writeFileSync(out, html, 'utf8');
console.log('inlined images:', inlined);
console.log('output:', out);
console.log('bytes:', fs.statSync(out).size);
