// // src/middleware.ts
// import { NextRequest, NextResponse } from 'next/server'
// import { authTokenStorage } from '@/shared/lib/storage/auth-token'
//
// const PROTECTED_PATHS = ['/profile', '/users', '/posts', '/notifications', '/messenger']
// const PUBLIC_PATHS = ['/auth', '/health', '/public-user']
//
// export function middleware(req: NextRequest) {
//   const { pathname } = req.nextUrl
//   const token = req.cookies.get('accessToken')?.value || authTokenStorage.getAccessToken()
//
//   // Для API-роутов
//   if (pathname.startsWith('/api')) {
//     if (pathname.startsWith('/api/protected') && !token) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//     }
//     return NextResponse.next()
//   }
//
//   // Для страниц
//   if (isProtected(pathname) && !token) {
//     return NextResponse.redirect(new URL('/auth/login', req.url))
//   }
//
//   if (isPublic(pathname) && token && !pathname.startsWith('/auth/logout')) {
//     return NextResponse.redirect(new URL('/profile', req.url))
//   }
//
//   return NextResponse.next()
// }
//
// function isProtected(path: string) {
//   return PROTECTED_PATHS.some(p => path.startsWith(p))
// }
//
// function isPublic(path: string) {
//   return PUBLIC_PATHS.some(p => path.startsWith(p))
// }
