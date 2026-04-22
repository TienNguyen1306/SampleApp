#!/usr/bin/env node
/**
 * update-wiki.js — Auto-update LLM Wiki khi code thay đổi
 *
 * Usage:
 *   ANTHROPIC_API_KEY=<key> node scripts/update-wiki.js [changedFiles...]
 *
 * Examples:
 *   node scripts/update-wiki.js backend/controllers/orderController.js
 *   node scripts/update-wiki.js frontend/pages/OrdersPage.jsx frontend/api/orders.js
 *   git diff --name-only HEAD~1 | xargs node scripts/update-wiki.js
 *
 * Nếu không truyền file nào, sẽ update toàn bộ wiki từ codebase.
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
if (!ANTHROPIC_API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY không được set')
  process.exit(1)
}

const ROOT = path.resolve(import.meta.dirname, '..')
const WIKI_DIR = path.join(ROOT, '.wiki')

// Map: file pattern → wiki page cần update
const FILE_TO_WIKI = [
  { pattern: /^backend\/routes\//, wiki: 'backend.md', section: 'API Routes' },
  { pattern: /^backend\/controllers\//, wiki: 'backend.md', section: 'Controllers' },
  { pattern: /^backend\/models\//, wiki: 'backend.md', section: 'Models' },
  { pattern: /^backend\/middleware\//, wiki: 'backend.md', section: 'Middleware' },
  { pattern: /^backend\/app\.js/, wiki: 'backend.md', section: 'Middleware Chain' },
  { pattern: /^frontend\/pages\//, wiki: 'frontend.md', section: 'Pages' },
  { pattern: /^frontend\/api\//, wiki: 'frontend.md', section: 'API Layer' },
  { pattern: /^frontend\/context\//, wiki: 'frontend.md', section: 'State Management' },
  { pattern: /^frontend\/i18n\//, wiki: 'frontend.md', section: 'i18n' },
  { pattern: /^frontend\/App\.jsx/, wiki: 'frontend.md', section: 'React Router' },
  { pattern: /^automation\/playwright\.config\.ts/, wiki: 'automation.md', section: 'Playwright Config' },
  { pattern: /^automation\/fixtures\//, wiki: 'automation.md', section: 'Fixtures' },
  { pattern: /^automation\/pages\//, wiki: 'automation.md', section: 'Page Objects' },
  { pattern: /^automation\/tests\//, wiki: 'automation.md', section: 'Test Patterns' },
  { pattern: /^automation\/api-services\//, wiki: 'automation.md', section: 'API Services' },
  { pattern: /^\.env\.example/, wiki: 'overview.md', section: 'Environment Variables' },
  { pattern: /^server\.js/, wiki: 'overview.md', section: 'Cách chạy' },
  { pattern: /^vite\.config\.js/, wiki: 'overview.md', section: 'Vite Proxy' },
]

function readFile(filePath) {
  try {
    return fs.readFileSync(path.join(ROOT, filePath), 'utf8')
  } catch {
    return null
  }
}

function readWiki(wikiFile) {
  try {
    return fs.readFileSync(path.join(WIKI_DIR, wikiFile), 'utf8')
  } catch {
    return ''
  }
}

function writeWiki(wikiFile, content) {
  fs.writeFileSync(path.join(WIKI_DIR, wikiFile), content, 'utf8')
}

function updateChangelog(updatedWikis) {
  const changelogPath = path.join(WIKI_DIR, 'changelog.md')
  const existing = fs.readFileSync(changelogPath, 'utf8')
  const date = new Date().toISOString().split('T')[0]
  const entry = `\n## ${date} — Auto-update\n\n- Updated: ${[...updatedWikis].join(', ')}\n`
  fs.writeFileSync(changelogPath, entry + existing)
}

async function callClaude(prompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-5',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error?.message || 'Claude API error')
  return data.content[0].text
}

async function updateWikiPage(wikiFile, changedFiles, sections) {
  console.log(`📝 Updating ${wikiFile}...`)

  const wikiContent = readWiki(wikiFile)
  const fileContents = changedFiles
    .map(f => {
      const content = readFile(f)
      return content ? `### ${f}\n\`\`\`\n${content.slice(0, 3000)}\n\`\`\`` : null
    })
    .filter(Boolean)
    .join('\n\n')

  const prompt = `You are maintaining an LLM wiki for a codebase. The wiki helps AI assistants generate accurate code without reading every source file.

The following source files have been updated:

${fileContents}

Current wiki page (${wikiFile}):
\`\`\`markdown
${wikiContent}
\`\`\`

Please update the wiki page to reflect the changes in the source files. Focus on the sections: ${sections.join(', ')}.

Rules:
- Keep the same markdown structure and style
- Update only what changed — don't rewrite sections that are still accurate
- Be concise — this wiki is for LLMs, not humans
- Keep code examples short and accurate
- Update the sections that correspond to the changed files
- Return ONLY the updated markdown content, no explanation

Return the complete updated wiki page in markdown format.`

  const updated = await callClaude(prompt)
  writeWiki(wikiFile, updated)
  console.log(`✅ ${wikiFile} updated`)
}

async function main() {
  const args = process.argv.slice(2)

  // Determine which files changed
  let changedFiles = args
  if (changedFiles.length === 0) {
    // No args: try to get changed files from git
    try {
      const gitDiff = execSync('git diff --name-only HEAD~1 HEAD 2>/dev/null || git diff --name-only HEAD', { cwd: ROOT }).toString().trim()
      changedFiles = gitDiff.split('\n').filter(Boolean)
    } catch {
      console.log('ℹ️  No changed files detected, updating full wiki...')
      changedFiles = []
    }
  }

  if (changedFiles.length === 0) {
    console.log('ℹ️  No files to process')
    return
  }

  console.log(`📂 Changed files: ${changedFiles.join(', ')}`)

  // Group changed files by wiki page
  const wikiUpdates = new Map() // wikiFile → { files: Set, sections: Set }

  for (const file of changedFiles) {
    // Skip wiki files themselves
    if (file.startsWith('.wiki/') || file.startsWith('scripts/') || file.startsWith('.github/')) continue

    for (const { pattern, wiki, section } of FILE_TO_WIKI) {
      if (pattern.test(file)) {
        if (!wikiUpdates.has(wiki)) {
          wikiUpdates.set(wiki, { files: new Set(), sections: new Set() })
        }
        wikiUpdates.get(wiki).files.add(file)
        wikiUpdates.get(wiki).sections.add(section)
      }
    }
  }

  if (wikiUpdates.size === 0) {
    console.log('ℹ️  No wiki pages need updating for these files')
    return
  }

  // Update each affected wiki page
  const updatedWikis = new Set()
  for (const [wikiFile, { files, sections }] of wikiUpdates) {
    await updateWikiPage(wikiFile, [...files], [...sections])
    updatedWikis.add(wikiFile)
  }

  // Update changelog
  updateChangelog(updatedWikis)
  console.log('\n🎉 Wiki update complete!')
  console.log(`Updated: ${[...updatedWikis].join(', ')}`)
}

main().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
