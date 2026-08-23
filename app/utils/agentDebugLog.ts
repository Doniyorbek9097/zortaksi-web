/**
 * Faqat dev rejimda ishlaydi — production da RAM va tarmoq chaqiruvlari yo'q.
 */
export function agentDebugLog(payload: {
  hypothesisId: string
  location: string
  message: string
  data?: Record<string, unknown>
}) {
  if (!import.meta.dev) return
  const body = {
    sessionId: '86b4d7',
    runId: 'post-fix',
    ...payload,
    timestamp: Date.now(),
  }
  const json = JSON.stringify(body)
  // #region agent log
  fetch('http://127.0.0.1:7750/ingest/fe00ea7a-4a26-4abf-929d-8d61a735465e', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': '86b4d7',
    },
    body: json,
  }).catch(() => {})
  if (import.meta.client) {
    fetch('/api/__agent_debug', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: json,
    }).catch(() => {})
    console.info('[DBG86b4d7]', payload.message, payload.data || {})
  }
  // #endregion
}
