import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { render } from '../themes/jsonresume-theme-reagle/index.js';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const resumePath = resolve(root, process.argv[2] ?? 'kristinreagle.json');
const outputPath = resolve(root, process.argv[3] ?? 'index.html');

const resume = JSON.parse(await readFile(resumePath, 'utf-8'));
const html = render(resume);
await writeFile(outputPath, html);

console.log(`Rendered ${outputPath}`);
