import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const apiUrl = process.env.VITE_API_URL || 'https://neighbourhub-backend.onrender.com'
const backend = apiUrl.replace(/\/api\/?$/, '').replace(/\/$/, '')

const config = {
  rewrites: [
    { source: '/uploads/:path*', destination: `${backend}/uploads/:path*` },
    { source: '/(.*)', destination: '/index.html' },
  ],
}

fs.writeFileSync(path.join(root, 'vercel.json'), `${JSON.stringify(config, null, 2)}\n`)
console.log(`vercel.json: /uploads/* -> ${backend}/uploads/*`)
