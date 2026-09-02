import path from 'path';
import fs from 'fs';
import { bundle } from '@remotion/bundler';

async function build() {
  const baseDir = process.cwd();
  const outDir = path.resolve(baseDir, '.remotion-bundle');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log('[Remotion] Pre-compiling persistent bundle to:', outDir);
  const t0 = Date.now();

  await bundle({
    entryPoint: path.resolve(baseDir, 'src/remotion/index.ts'),
    outDir: outDir,
    enableCaching: true,
  });

  console.log(`[Remotion] Pre-compilation complete in ${((Date.now() - t0) / 1000).toFixed(2)}s!`);
}

build().catch(err => {
  console.error('[Remotion] Pre-compile error:', err);
});
