import { appendFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

/** Debug-mode NDJSON sink → workspace debug-86b4d7.log */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const line = JSON.stringify({
    sessionId: '86b4d7',
    ...(typeof body === 'object' && body ? body : { message: String(body) }),
    timestamp: Date.now(),
  })
  const logPath = resolve(process.cwd(), '..', 'debug-86b4d7.log')
  try {
    await mkdir(dirname(logPath), { recursive: true })
    await appendFile(logPath, line + '\n', 'utf8')
  } catch (err: any) {
    console.warn('[agent-debug] write fail', err?.message || err)
  }
  return { ok: true }
})
