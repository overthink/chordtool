// Ensure better-sqlite3 native binary is available.
// pnpm v10 blocks build scripts by default; this postinstall script
// downloads the prebuilt binary via prebuild-install if needed.
import { createRequire } from 'module'
import { execSync } from 'child_process'
import { resolve } from 'path'

const require = createRequire(import.meta.url)

try {
  require('better-sqlite3')
  // Binary already present, nothing to do
} catch {
  const pkgPath = resolve(
    require.resolve('better-sqlite3/package.json'),
    '..'
  )
  console.log('better-sqlite3: downloading prebuilt binary...')
  execSync('npx prebuild-install', { cwd: pkgPath, stdio: 'inherit' })
}
