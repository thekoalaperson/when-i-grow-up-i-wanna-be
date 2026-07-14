// Turns the self-contained `dist-single/index.html` build into two deliverables:
//   1. standalone/future-map.html — a complete HTML document you can double-click to open.
//   2. artifact/future-map.html   — body-level content for publishing as a claude.ai Artifact
//      (the Artifact host wraps the file in its own <!doctype><head><body> skeleton, so this
//       file must NOT carry its own document tags).
//
// Run after `npm run build:single`.  Or just: `npm run artifact`.

import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'dist-single', 'index.html')
const html = readFileSync(src, 'utf8')

// 1) complete standalone document — as built
mkdirSync(join(root, 'standalone'), { recursive: true })
copyFileSync(src, join(root, 'standalone', 'future-map.html'))

// 2) body-only content for the Artifact host
const style = html.match(/<style[^>]*>([\s\S]*?)<\/style>/)?.[1]
const script = html.match(/<script[^>]*type="module"[^>]*>([\s\S]*?)<\/script>/)?.[1]
if (!style || !script) throw new Error('could not extract inlined <style>/<script> from build')
if (style.includes('</style>') || script.includes('</script>'))
  throw new Error('inlined content leaked a closing tag — aborting to avoid a broken embed')

const body =
  '<title>Future Map — decide with your eyes open</title>\n' +
  '<style>\n' + style.trim() + '\n</style>\n' +
  '<div id="root"></div>\n' +
  '<script type="module">\n' + script.trim() + '\n</script>\n'

mkdirSync(join(root, 'artifact'), { recursive: true })
writeFileSync(join(root, 'artifact', 'future-map.html'), body)

console.log('wrote standalone/future-map.html and artifact/future-map.html')
