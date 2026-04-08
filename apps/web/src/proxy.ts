import { auth } from '@/lib/auth';
import { ROLE_HOME, ROLE_PREFIX_ACCESS, type AppRole } from '@/lib/roles';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const userRole = (req.auth?.user as { role?: AppRole } | undefined)?.role;
  const { nextUrl } = req;

  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(nextUrl.pathname);
  const isRootPage = nextUrl.pathname === '/';
  const protectedPrefixes = Object.keys(ROLE_PREFIX_ACCESS);
  const matchedPrefix = protectedPrefixes.find((prefix) => nextUrl.pathname.startsWith(prefix));

  if (matchedPrefix && !isLoggedIn) {
    return Response.redirect(new URL('/login', nextUrl));
  }

  if (matchedPrefix && userRole) {
    const allowed = ROLE_PREFIX_ACCESS[matchedPrefix] ?? [];
    if (!allowed.includes(userRole)) {
      return Response.redirect(new URL(ROLE_HOME[userRole], nextUrl));
    }
  }

  if ((isAuthPage || isRootPage) && isLoggedIn) {
    const home = userRole ? ROLE_HOME[userRole] : '/login';
    return Response.redirect(new URL(home, nextUrl));
  }

  if (isRootPage && !isLoggedIn) {
    return Response.redirect(new URL('/login', nextUrl));
  }
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
