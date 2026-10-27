// Offline fallback bundler (esbuild only). The canonical build is `npm run build` (Vite).
// Usage: NODE_PATH=<dir with react> ESBUILD_MODULE=<path to esbuild> node scripts/offline-build.mjs
import { readFile, writeFile, rm, mkdir } from 'node:fs/promises';

const mod = await import(process.env.ESBUILD_MODULE ?? 'esbuild');
const esbuild = mod.build ? mod : mod.default;

await rm('dist', { recursive: true, force: true });
await mkdir('dist/assets', { recursive: true });

const result = await esbuild.build({
  entryPoints: ['src/main.tsx'],
  outdir: 'dist/assets',
  entryNames: 'app',
  bundle: true,
  format: 'esm',
  jsx: 'automatic',
  target: 'es2020',
  minify: true,
  sourcemap: true,
  metafile: true,
  nodePaths: process.env.NODE_PATH ? process.env.NODE_PATH.split(':') : [],
  define: { 'process.env.NODE_ENV': '"production"' },
  logLevel: 'info',
});

const html = (await readFile('index.html', 'utf8')).replace(
  '<script type="module" src="/src/main.tsx"></script>',
  '<link rel="stylesheet" href="/assets/app.css" />\n    <script type="module" src="/assets/app.js"></script>',
);
await writeFile('dist/index.html', html);
console.log('Built dist/ with', Object.keys(result.metafile.outputs).length, 'outputs');
