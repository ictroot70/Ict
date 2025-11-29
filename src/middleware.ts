import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl

  // Проверяем наличие обоих параметров: postId и action=create
  const hasPostId = searchParams.has('postId')
  const hasActionCreate = searchParams.get('action') === 'create'

  // Если есть оба параметра, удаляем action из URL
  if (hasPostId && hasActionCreate) {
    const url = req.nextUrl.clone()
    url.searchParams.delete('action')

    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// Опционально: настройка matcher для оптимизации
// Применяем middleware только к нужным путям
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
