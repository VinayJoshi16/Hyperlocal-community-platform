import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

const config = {
  rewrites: [{ source: '/(.*)', destination: '/index.html' }],
}

fs.writeFileSync(path.join(root, 'vercel.json'), `${JSON.stringify(config, null, 2)}\n`)
console.log('vercel.json: SPA rewrites only (uploads served via Vercel Blob URLs)')
