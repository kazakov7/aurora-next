import { useRouter } from 'next/router';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo } from 'react';
import en from './messages/en.json';
import ko from './messages/ko.json';
import uz from './messages/uz.json';

export type AppLocale = 'en' | 'ko' | 'uz';
interface TranslationDictionary {
	[key: string]: string | TranslationDictionary;
}

const dictionaries: Record<AppLocale, TranslationDictionary> = { en, ko, uz };

interface I18nContextValue {
	locale: AppLocale;
	t: (key: string, values?: Record<string, string | number>) => string;
	changeLocale: (locale: AppLocale) => Promise<boolean>;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const readTranslation = (dictionary: TranslationDictionary, key: string): string | undefined => {
	const value = key.split('.').reduce<string | TranslationDictionary | undefined>((current, segment) => {
		if (!current || typeof current === 'string') return undefined;
		return current[segment];
	}, dictionary);
	return typeof value === 'string' ? value : undefined;
};

const interpolate = (value: string, variables?: Record<string, string | number>): string =>
	value.replace(/\{\{(\w+)\}\}/g, (token, variable) => String(variables?.[variable] ?? token));

export const I18nProvider = ({ children }: { children: ReactNode }) => {
	const router = useRouter();
	const locale = (router.locale && ['en', 'ko', 'uz'].includes(router.locale) ? router.locale : 'en') as AppLocale;

	const changeLocale = useCallback(async (nextLocale: AppLocale): Promise<boolean> => {
		if (typeof window !== 'undefined') {
			window.localStorage.setItem('aurora-locale', nextLocale);
			document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
		}
		return router.push({ pathname: router.pathname, query: router.query }, undefined, { locale: nextLocale, scroll: false });
	}, [router]);

	useEffect(() => {
		if (!router.isReady || typeof window === 'undefined') return;
		const savedLocale = window.localStorage.getItem('aurora-locale') as AppLocale | null;
		if (savedLocale && savedLocale !== locale && ['en', 'ko', 'uz'].includes(savedLocale)) {
			void router.replace({ pathname: router.pathname, query: router.query }, undefined, { locale: savedLocale, scroll: false });
		}
	}, [locale, router]);

	const value = useMemo<I18nContextValue>(() => ({
		locale,
		t: (key, variables) => interpolate(readTranslation(dictionaries[locale], key) ?? readTranslation(en, key) ?? key, variables),
		changeLocale,
	}), [changeLocale, locale]);

	return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextValue => {
	const context = useContext(I18nContext);
	if (!context) throw new Error('useI18n must be used inside I18nProvider');
	return context;
};
