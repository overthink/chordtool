import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const DENY = new NextResponse('Unauthorized', {
  status: 401,
  headers: { 'WWW-Authenticate': 'Basic realm="Chord Trainer"' },
})

export function proxy(request: NextRequest) {
  const password = process.env.BASIC_AUTH_PASSWORD
  if (!password) return DENY

  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Basic ')) {
    const credentials = atob(authHeader.slice(6))
    const colonIndex = credentials.indexOf(':')
    const provided = credentials.slice(colonIndex + 1)
    if (provided === password) {
      return NextResponse.next()
    }
  }

  return DENY
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
