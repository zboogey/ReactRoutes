import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

// Public files that are part of the app shell and must work offline
const PUBLIC_PRECACHE = ['/offline.html', '/manifest.json', '/favicon.svg', '/icons/']

function listFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? listFiles(path) : [path]
  })
}

/**
 * Builds /sw.js from src/sw.js:
 * - injects the list of files to pre-cache (every built JS/CSS/asset + index.html + shell files from /public)
 * - injects a version hash, so every deploy gets a new precache name and the old one is deleted on activate
 */
function serviceWorker() {
  return {
    name: 'shop-service-worker',
    apply: 'build',
    enforce: 'post',
    generateBundle(_, bundle) {
      const publicFiles = listFiles('public')
        .map((path) => '/' + relative('public', path).replaceAll('\\', '/'))
        .filter((url) => PUBLIC_PRECACHE.some((p) => (p.endsWith('/') ? url.startsWith(p) : url === p)))

      const built = Object.keys(bundle)
        .filter((file) => !file.endsWith('.map'))
        .map((file) => '/' + file)

      const urls = [...new Set([...built, ...publicFiles])].sort()
      const template = readFileSync('src/sw.js', 'utf8')

      const hash = createHash('sha256').update(template).update(urls.join('\n'))
      const html = bundle['index.html']
      if (html) hash.update(html.source)
      publicFiles.forEach((url) => hash.update(readFileSync(join('public', url))))
      const version = hash.digest('hex').slice(0, 10)

      const source = template
        .replace(/^const VERSION = .*$/m, `const VERSION = '${version}'`)
        .replace(/^const PRECACHE_URLS = .*$/m, `const PRECACHE_URLS = ${JSON.stringify(urls, null, 2)}`)

      if (source.includes('__BUILD_VERSION__') || source.includes('self.__PRECACHE_MANIFEST')) {
        this.error('sw.js placeholders were not replaced')
      }

      this.emitFile({ type: 'asset', fileName: 'sw.js', source })
    },
  }
}

export default defineConfig({ plugins: [react(), serviceWorker()] })
