// Builds a single self-contained HTML page (CSS and JS inlined) for hosting as a claude.ai artifact.
// Usage: node scripts/build-artifact.mjs  ->  dist-artifact/page.html
import { execSync } from 'node:child_process';
import { readdir, readFile, writeFile } from 'node:fs/promises';

execSync('npx vite build --mode artifact --outDir dist-artifact', { stdio: 'inherit' });
const files = await readdir('dist-artifact/assets');
const css = await readFile('dist-artifact/assets/' + files.find((f) => f.endsWith('.css')), 'utf8');
const js = (await readFile('dist-artifact/assets/' + files.find((f) => f.endsWith('.js')), 'utf8')).replaceAll('</script', '<\\/script');

const page = `<title>Our Little Universe</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400..700;1,9..40,400..700&family=Fraunces:opsz,wght,SOFT@9..144,400..700,0..100&display=swap" rel="stylesheet">
<style>${css}</style>
<div id="root"></div>
<script>
  try {
    var p = localStorage.getItem('olu:theme') || 'system';
    var d = p === 'dark' || (p === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = d ? 'dark' : 'light';
  } catch (e) {}
</script>
<script type="module">${js}</script>
`;
await writeFile('dist-artifact/page.html', page);
console.log('Wrote dist-artifact/page.html', (page.length / 1024).toFixed(0) + ' KB');
