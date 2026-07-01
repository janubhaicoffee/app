import { NextResponse } from 'next/server'

const oldAuthPaths = ['/auth/login', '/auth/signup']

export default async function proxy(request) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') || ''
  const host = hostname.split(':')[0]

  if (host.startsWith('pos.')) {
    if (pathname.startsWith('/pos')) {
      return NextResponse.next()
    }
    return NextResponse.rewrite(
      new URL(`/pos${pathname}${request.nextUrl.search}`, request.url)
    )
  }

  if (host.startsWith('outlet.')) {
    if (pathname.startsWith('/outlet')) {
      return NextResponse.next()
    }
    return NextResponse.rewrite(
      new URL(`/outlet${pathname}${request.nextUrl.search}`, request.url)
    )
  }

  if (host.startsWith('admin.')) {
    if (pathname.startsWith('/admin')) {
      return NextResponse.next()
    }
    return NextResponse.rewrite(
      new URL(`/admin${pathname}${request.nextUrl.search}`, request.url)
    )
  }

  // Redirect old auth pages to unified, EXCEPT for administrative redirects
  if (oldAuthPaths.some(p => pathname.startsWith(p))) {
    const redirect = request.nextUrl.searchParams.get('redirect') || '';
    if (!host.startsWith('outlet.') && !redirect.startsWith('/outlet') && !redirect.startsWith('/pos') && !redirect.startsWith('/admin')) {
      const url = new URL('/auth/unified', request.url)
      if (redirect) url.searchParams.set('redirect', redirect)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)']
}
