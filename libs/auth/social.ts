const KAKAO_STATE_KEY = 'aurora.kakao.oauth.state';
const KAKAO_REFERRER_KEY = 'aurora.kakao.oauth.referrer';
const TELEGRAM_OAUTH_KEY = 'aurora.telegram.oauth';
const TELEGRAM_AUTHORIZATION_ENDPOINT = 'https://oauth.telegram.org/auth';
const TELEGRAM_CALLBACK_PATH = '/auth/telegram/callback';
const TELEGRAM_REQUEST_TTL_MS = 10 * 60 * 1000;

declare global {
	interface Window {
		google?: {
			accounts: {
			id: {
				initialize: (options: {
					client_id: string;
					callback: (response: { credential?: string }) => void;
					auto_select?: boolean;
					cancel_on_tap_outside?: boolean;
					use_fedcm_for_button?: boolean;
				}) => void;
				renderButton: (parent: HTMLElement, options: {
					type?: 'standard' | 'icon';
					theme?: 'outline' | 'filled_blue' | 'filled_black';
					size?: 'large' | 'medium' | 'small';
					text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
					shape?: 'rectangular' | 'pill' | 'circle' | 'square';
					logo_alignment?: 'left' | 'center';
					width?: number;
				}) => void;
				};
			};
		};
	}
}

const getRequiredPublicEnv = (
	name: 'NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID' | 'NEXT_PUBLIC_KAKAO_REST_API_KEY' | 'NEXT_PUBLIC_KAKAO_REDIRECT_URI' | 'NEXT_PUBLIC_TELEGRAM_CLIENT_ID',
): string => {
	// Next.js inlines public environment variables in browser bundles only when
	// they are accessed statically. Do not replace this with process.env[name].
	const values = {
		NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID,
		NEXT_PUBLIC_KAKAO_REST_API_KEY: process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY,
		NEXT_PUBLIC_KAKAO_REDIRECT_URI: process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI,
		NEXT_PUBLIC_TELEGRAM_CLIENT_ID: process.env.NEXT_PUBLIC_TELEGRAM_CLIENT_ID,
	};
	const value = values[name]?.trim();
	if (!value) throw new Error('SOCIAL_AUTH_NOT_CONFIGURED');
	return value;
};

export const getKakaoRedirectUri = (): string => getRequiredPublicEnv('NEXT_PUBLIC_KAKAO_REDIRECT_URI');

export const getSafeAuthRedirect = (value: unknown): string => {
	if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return '/mypage';
	return value;
};

const loadGoogleIdentityScript = (): Promise<void> => {
	if (typeof window === 'undefined') return Promise.reject(new Error('SOCIAL_AUTH_UNAVAILABLE'));
	if (window.google?.accounts?.id) return Promise.resolve();

	return new Promise((resolve, reject) => {
		let settled = false;
		const finish = (callback: () => void) => {
			if (settled) return;
			settled = true;
			window.clearTimeout(timeout);
			callback();
		};
		const timeout = window.setTimeout(() => finish(() => reject(new Error('SOCIAL_AUTH_UNAVAILABLE'))), 10_000);
		const existing = document.getElementById('google-identity-services');
		if (existing) {
			if (existing.dataset.loaded === 'true') {
				finish(() => reject(new Error('SOCIAL_AUTH_UNAVAILABLE')));
				return;
			}
			existing.addEventListener('load', () => finish(() => resolve()), { once: true });
			existing.addEventListener('error', () => finish(() => reject(new Error('SOCIAL_AUTH_UNAVAILABLE'))), { once: true });
			return;
		}

		const script = document.createElement('script');
		script.id = 'google-identity-services';
		script.src = 'https://accounts.google.com/gsi/client';
		script.async = true;
		script.defer = true;
		script.onload = () => {
			script.dataset.loaded = 'true';
			finish(() => resolve());
		};
		script.onerror = () => finish(() => reject(new Error('SOCIAL_AUTH_UNAVAILABLE')));
		document.head.appendChild(script);
	});
};

export const renderGoogleSignInButton = async (
	container: HTMLElement,
	onCredential: (credential: string) => void,
): Promise<void> => {
	const clientId = getRequiredPublicEnv('NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID');
	await loadGoogleIdentityScript();
	if (!window.google?.accounts?.id) throw new Error('SOCIAL_AUTH_UNAVAILABLE');
	const googleIdentity = window.google.accounts.id;
	container.replaceChildren();
	googleIdentity.initialize({
		client_id: clientId,
		auto_select: false,
		use_fedcm_for_button: true,
		callback: ({ credential }) => {
			if (credential) onCredential(credential);
		},
	});
	googleIdentity.renderButton(container, {
		type: 'standard',
		theme: 'outline',
		size: 'large',
		text: 'continue_with',
		shape: 'rectangular',
		logo_alignment: 'left',
		width: 400,
	});
};

export const getGoogleAuthErrorMessage = (error: unknown, action: 'sign-in' | 'sign-up'): string => {
	const code = error instanceof Error ? error.message : '';
	if (code === 'SOCIAL_AUTH_NOT_CONFIGURED') return 'Google sign-in is not configured.';
	return `Google ${action} could not be completed. Please try again.`;
};

const createOAuthState = (): string => {
	const bytes = new Uint8Array(32);
	window.crypto.getRandomValues(bytes);
	return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

export const startKakaoAuthorization = (referrer: unknown): void => {
	if (typeof window === 'undefined') throw new Error('SOCIAL_AUTH_UNAVAILABLE');
	const state = createOAuthState();
	const redirectUri = getKakaoRedirectUri();
	const clientId = getRequiredPublicEnv('NEXT_PUBLIC_KAKAO_REST_API_KEY');
	window.sessionStorage.setItem(KAKAO_STATE_KEY, state);
	window.sessionStorage.setItem(KAKAO_REFERRER_KEY, getSafeAuthRedirect(referrer));

	const authorizeUrl = new URL('https://kauth.kakao.com/oauth/authorize');
	authorizeUrl.searchParams.set('response_type', 'code');
	authorizeUrl.searchParams.set('client_id', clientId);
	authorizeUrl.searchParams.set('redirect_uri', redirectUri);
	authorizeUrl.searchParams.set('state', state);
	window.location.assign(authorizeUrl.toString());
};

export const consumeKakaoAuthorizationState = (state: unknown): string | null => {
	if (typeof window === 'undefined' || typeof state !== 'string') return null;
	const expectedState = window.sessionStorage.getItem(KAKAO_STATE_KEY);
	const referrer = window.sessionStorage.getItem(KAKAO_REFERRER_KEY);
	window.sessionStorage.removeItem(KAKAO_STATE_KEY);
	window.sessionStorage.removeItem(KAKAO_REFERRER_KEY);
	if (!expectedState || state !== expectedState) return null;
	return getSafeAuthRedirect(referrer);
};

/** ==================== TELEGRAM (OpenID Connect, authorization code + PKCE S256) ==================== **/

interface TelegramOAuthRequest {
	state: string;
	codeVerifier: string;
	referrer: string;
	createdAt: number;
}

export interface TelegramAuthorizationResult {
	redirectTarget: string;
	codeVerifier: string;
}

const toBase64Url = (bytes: Uint8Array): string => {
	let binary = '';
	bytes.forEach((byte) => {
		binary += String.fromCharCode(byte);
	});
	return window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

/** 32 random bytes -> 43 base64url characters, matching the backend TelegramAuthInput.codeVerifier rule **/
const createPkceVerifier = (): string => {
	const bytes = new Uint8Array(32);
	window.crypto.getRandomValues(bytes);
	return toBase64Url(bytes);
};

const createPkceChallenge = async (verifier: string): Promise<string> => {
	if (!window.crypto?.subtle) throw new Error('SOCIAL_AUTH_UNAVAILABLE');
	const digest = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
	return toBase64Url(new Uint8Array(digest));
};

/**
 * The redirect URI is always this site's own callback so the PKCE verifier kept in sessionStorage
 * is available when Telegram returns. The exact value must be registered in BotFather
 * (Bot Settings > Login Widget > Allowed URLs).
 **/
export const getTelegramRedirectUri = (): string => {
	if (typeof window === 'undefined') throw new Error('SOCIAL_AUTH_UNAVAILABLE');
	return `${window.location.origin}${TELEGRAM_CALLBACK_PATH}`;
};

export const startTelegramAuthorization = async (referrer: unknown): Promise<void> => {
	if (typeof window === 'undefined') throw new Error('SOCIAL_AUTH_UNAVAILABLE');
	const clientId = getRequiredPublicEnv('NEXT_PUBLIC_TELEGRAM_CLIENT_ID');
	const state = createOAuthState();
	const codeVerifier = createPkceVerifier();
	const codeChallenge = await createPkceChallenge(codeVerifier);
	const request: TelegramOAuthRequest = { state, codeVerifier, referrer: getSafeAuthRedirect(referrer), createdAt: Date.now() };
	window.sessionStorage.setItem(TELEGRAM_OAUTH_KEY, JSON.stringify(request));

	const authorizeUrl = new URL(TELEGRAM_AUTHORIZATION_ENDPOINT);
	authorizeUrl.searchParams.set('client_id', clientId);
	authorizeUrl.searchParams.set('redirect_uri', getTelegramRedirectUri());
	authorizeUrl.searchParams.set('response_type', 'code');
	authorizeUrl.searchParams.set('scope', 'openid profile');
	authorizeUrl.searchParams.set('state', state);
	authorizeUrl.searchParams.set('code_challenge', codeChallenge);
	authorizeUrl.searchParams.set('code_challenge_method', 'S256');
	window.location.assign(authorizeUrl.toString());
};

/** One-time read of the pending request: returns null for a missing, mismatched or expired state **/
export const consumeTelegramAuthorizationState = (state: unknown): TelegramAuthorizationResult | null => {
	if (typeof window === 'undefined' || typeof state !== 'string' || !state) return null;
	const stored = window.sessionStorage.getItem(TELEGRAM_OAUTH_KEY);
	window.sessionStorage.removeItem(TELEGRAM_OAUTH_KEY);
	if (!stored) return null;
	try {
		const request = JSON.parse(stored) as Partial<TelegramOAuthRequest>;
		if (request.state !== state || typeof request.codeVerifier !== 'string') return null;
		if (typeof request.createdAt !== 'number' || Date.now() - request.createdAt > TELEGRAM_REQUEST_TTL_MS) return null;
		return { redirectTarget: getSafeAuthRedirect(request.referrer), codeVerifier: request.codeVerifier };
	} catch {
		return null;
	}
};

export const getTelegramAuthErrorMessage = (error: unknown): string => {
	const code = error instanceof Error ? error.message : '';
	if (code === 'SOCIAL_AUTH_NOT_CONFIGURED') return 'Telegram sign-in is not configured.';
	return 'Telegram sign-in could not be started. Please try again.';
};
