import { NextResponse, type NextRequest } from 'next/server'

export default function proxy(request: NextRequest) {
  const session = request.cookies.get('__session')
  const isAuth = !!session?.value
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')

  if (!isAuth && !isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    return NextResponse.redirect(url)
  }

  if (isAuth && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icon-.*).*)'],
}
