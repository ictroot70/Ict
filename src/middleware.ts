import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl

  if (pathname.startsWith('/_next/data')) {
    return NextResponse.next()
  }

  const hasPostId = searchParams.has('postId')
  const hasActionCreate = searchParams.get('action') === 'create'

  if (hasPostId && hasActionCreate) {
    const url = req.nextUrl.clone()

    url.searchParams.delete('action')

    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|_next/data|favicon.ico).*)'],
}
