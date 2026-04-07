import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const jwt = request.cookies.get('jwt');
  const path = request.nextUrl.pathname;

  if (path === '/' || path === '/dashboard' || path.startsWith('/settings') || path === '/favorites') {
    console.log(`[middleware] ${path} — jwt cookie: ${jwt ? 'present' : 'MISSING'}, all cookies: [${request.cookies.getAll().map(c => c.name).join(', ')}]`);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|api).*)'],
};
