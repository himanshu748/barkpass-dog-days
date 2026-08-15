export function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}

export function postOnly(request) {
  return request.method === 'POST' ? null : json({ error: 'Use POST for this endpoint.' }, 405)
}

export async function readJson(request) {
  try {
    return await request.json()
  } catch {
    throw new Error('Send a valid JSON request body.')
  }
}

export function requireEnv(name) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not configured.`)
  return value
}

export function safeMessage(error, fallback) {
  if (error instanceof Error && /is not configured|valid JSON|required|invalid/i.test(error.message)) return error.message
  return fallback
}

export function requestOrigin(request) {
  const forwardedHost = request.headers.get('x-forwarded-host')
  const host = forwardedHost || request.headers.get('host')
  const protocol = request.headers.get('x-forwarded-proto') || 'https'
  return host ? `${protocol}://${host}` : new URL(request.url).origin
}
