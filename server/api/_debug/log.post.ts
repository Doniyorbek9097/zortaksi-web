import { appendFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'

/** Debug-mode NDJSON ingest (local only) */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const line = JSON.stringify({
    sessionId: '1179ab',
    ...body,
    timestamp: body?.timestamp || Date.now(),
  })

  // workspace: ZorTaksi/.cursor/debug-1179ab.log
  const logPath = join(process.cwd(), '..', '.cursor', 'debug-1179ab.log')
  try {
    await mkdir(dirname(logPath), { recursive: true })
    await appendFile(logPath, `${line}\n`, 'utf8')
  } catch (e: any) {
    // fallback: frontend/.cursor
    const alt = join(process.cwd(), '.cursor', 'debug-1179ab.log')
    await mkdir(dirname(alt), { recursive: true })
    await appendFile(alt, `${line}\n`, 'utf8')
  }

  return { ok: true }
})
