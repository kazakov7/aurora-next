import { NextRequest, NextResponse } from 'next/server';

const LOCALES = ['en', 'ko', 'uz'];
const DEFAULT_LOCALE = 'en';
const LOCALE_COOKIE = 'NEXT_LOCALE';

/**
 * Applies the language saved by the switcher (NEXT_LOCALE cookie) on the server, so a returning
 * Korean or Uzbek visitor is not served an English first paint on unprefixed URLs.
 *
 * - No cookie, or cookie = en: nothing happens; `/` keeps serving English.
 * - `/ko/...` and `/uz/...` always win over the cookie.
 * - Client-side transitions are never redirected; only full page loads are.
 * - Next strips the default-locale prefix before middleware runs, so `/en/...` cannot be told apart
 *   from the unprefixed URL; English is selected through the language switcher, which rewrites the cookie.
 * `localeDetection` stays off in next.config.js, so Accept-Language never redirects anyone.
 **/
export function middleware(request: NextRequest) {
	const savedLocale = request.cookies.get(LOCALE_COOKIE)?.value;
	if (!savedLocale || savedLocale === DEFAULT_LOCALE || !LOCALES.includes(savedLocale)) return NextResponse.next();

	const { nextUrl } = request;
	if (nextUrl.locale !== DEFAULT_LOCALE) return NextResponse.next();
	if (request.headers.has('x-nextjs-data') || request.headers.has('x-middleware-prefetch')) return NextResponse.next();

	const url = nextUrl.clone();
	url.locale = savedLocale;
	return NextResponse.redirect(url);
}

export const config = {
	/** Pages only: API routes, Next internals, OAuth callbacks and static files are left untouched **/
	matcher: ['/', '/((?!api/|_next/|auth/|.*\\.[\\w]+$).*)'],
};
