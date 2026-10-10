import { useRouter } from 'next/router';
import React, { createContext, ReactNode, useCallback, useContext, useMemo } from 'react';
import { parseApiDate } from '../utils';
import { SERVER_MESSAGE_IDS } from './serverMessages';
import en from './messages/en.json';
import ko from './messages/ko.json';
import uz from './messages/uz.json';

export type AppLocale = 'en' | 'ko' | 'uz';
export const APP_LOCALES: AppLocale[] = ['en', 'ko', 'uz'];
export const DEFAULT_LOCALE: AppLocale = 'en';
export const LOCALE_COOKIE = 'NEXT_LOCALE';

interface TranslationDictionary {
	[key: string]: string | TranslationDictionary;
}

export type TranslationValues = Record<string, string | number | null | undefined>;
export type DatePreset = 'short' | 'medium' | 'long' | 'monthYear' | 'shortMonthYear' | 'time' | 'dateTime';
type DateInput = Date | string | number | null | undefined;

const dictionaries: Record<AppLocale, TranslationDictionary> = { en, ko, uz };

/** BCP 47 tags passed to Intl; the route locale stays `en` | `ko` | `uz` **/
const INTL_LOCALES: Record<AppLocale, string> = { en: 'en-US', ko: 'ko-KR', uz: 'uz-Latn-UZ' };

const DATE_PRESETS: Record<DatePreset, Intl.DateTimeFormatOptions> = {
	short: { month: 'short', day: 'numeric' },
	medium: { month: 'short', day: 'numeric', year: 'numeric' },
	long: { month: 'long', day: 'numeric', year: 'numeric' },
	monthYear: { month: 'long', year: 'numeric' },
	shortMonthYear: { month: 'short', year: 'numeric' },
	time: { hour: 'numeric', minute: '2-digit' },
	dateTime: { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' },
};

const RELATIVE_UNITS: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
	{ unit: 'year', seconds: 31_536_000 },
	{ unit: 'month', seconds: 2_592_000 },
	{ unit: 'week', seconds: 604_800 },
	{ unit: 'day', seconds: 86_400 },
	{ unit: 'hour', seconds: 3_600 },
	{ unit: 'minute', seconds: 60 },
];

export const isAppLocale = (value?: string | null): value is AppLocale => !!value && (APP_LOCALES as string[]).includes(value);

const readTranslation = (dictionary: TranslationDictionary, key: string): string | undefined => {
	const value = key.split('.').reduce<string | TranslationDictionary | undefined>((current, segment) => {
		if (!current || typeof current === 'string') return undefined;
		return current[segment];
	}, dictionary);
	return typeof value === 'string' ? value : undefined;
};

const pluralRules: Partial<Record<AppLocale, Intl.PluralRules>> = {};
const getPluralCategory = (locale: AppLocale, count: number): string => {
	if (!pluralRules[locale]) pluralRules[locale] = new Intl.PluralRules(INTL_LOCALES[locale]);
	return (pluralRules[locale] as Intl.PluralRules).select(count);
};

/** `key_one` / `key_other` variants are tried first when a numeric `count` is passed **/
const readPlural = (locale: AppLocale, key: string, count: unknown): string | undefined => {
	const dictionary = dictionaries[locale];
	if (typeof count === 'number') {
		return (
			readTranslation(dictionary, `${key}_${getPluralCategory(locale, count)}`) ??
			readTranslation(dictionary, `${key}_other`) ??
			readTranslation(dictionary, key)
		);
	}
	return readTranslation(dictionary, key);
};

const resolveMessage = (locale: AppLocale, key: string, count?: unknown): string | undefined =>
	readPlural(locale, key, count) ?? (locale === DEFAULT_LOCALE ? undefined : readPlural(DEFAULT_LOCALE, key, count));

const interpolate = (message: string, values?: TranslationValues): string =>
	message.replace(/\{\{(\w+)\}\}/g, (token, name) => (values && name in values ? String(values[name] ?? '') : token));

export const translate = (locale: AppLocale, key: string, values?: TranslationValues): string =>
	interpolate(resolveMessage(locale, key, values?.count) ?? key, values);

/** `SOME_VALUE` -> `Some value`, used when an enum value has no dictionary entry **/
const humanizeEnum = (value: string): string => {
	const text = value.replace(/_/g, ' ').toLowerCase();
	return text.charAt(0).toUpperCase() + text.slice(1);
};

export const translateEnum = (locale: AppLocale, group: string, value?: string | null): string => {
	if (!value) return '';
	return resolveMessage(locale, `enums.${group}.${value}`) ?? resolveMessage(locale, `enums.common.${value}`) ?? humanizeEnum(value);
};

const toKeySegment = (value: string): string =>
	value
		.trim()
		.split(/[^A-Za-z0-9]+/)
		.filter(Boolean)
		.map((word, index) => (index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()))
		.join('');

/** Label for a value the API stores as English text (amenities): `amenities.airConditioning`, else the value itself **/
export const translateValue = (locale: AppLocale, namespace: string, value?: string | null): string => {
	if (!value) return '';
	return resolveMessage(locale, `${namespace}.${toKeySegment(value)}`) ?? value;
};

/** API messages are English; known ones are translated, anything else is shown as received **/
export const translateServerMessage = (locale: AppLocale, message: string): string => {
	const id = SERVER_MESSAGE_IDS[message];
	return id ? resolveMessage(locale, `serverErrors.${id}`) ?? message : message;
};

const readErrorMessage = (error: unknown): string => {
	if (typeof error === 'string') return error;
	if (typeof error === 'object' && error !== null && 'message' in error) {
		const { message } = error as { message?: unknown };
		return typeof message === 'string' ? message : '';
	}
	return '';
};

export const translateError = (locale: AppLocale, error: unknown, fallbackKey: string = 'errors.somethingWentWrong'): string => {
	const message = readErrorMessage(error);
	return message ? translateServerMessage(locale, message) : translate(locale, fallbackKey);
};

const renderRich = (message: string, nodes: Record<string, ReactNode>): ReactNode =>
	message.split(/(\{\{\w+\}\})/g).map((part, index) => {
		const match = part.match(/^\{\{(\w+)\}\}$/);
		if (!match) return part;
		return <React.Fragment key={index}>{match[1] in nodes ? nodes[match[1]] : part}</React.Fragment>;
	});

const numberFormats: Record<string, Intl.NumberFormat> = {};
export const formatLocaleNumber = (locale: AppLocale, value?: number | null, options?: Intl.NumberFormatOptions): string => {
	if (typeof value !== 'number' || Number.isNaN(value)) return '';
	const cacheKey = `${locale}:${options ? JSON.stringify(options) : ''}`;
	if (!numberFormats[cacheKey]) numberFormats[cacheKey] = new Intl.NumberFormat(INTL_LOCALES[locale], options);
	return numberFormats[cacheKey].format(value);
};

const dateFormats: Record<string, Intl.DateTimeFormat> = {};
export const formatLocaleDate = (
	locale: AppLocale,
	value: DateInput,
	format: DatePreset | Intl.DateTimeFormatOptions = 'medium',
): string => {
	const date = parseApiDate(value ?? undefined);
	if (!date) return '';
	const options = typeof format === 'string' ? DATE_PRESETS[format] : format;
	const cacheKey = `${locale}:${JSON.stringify(options)}`;
	if (!dateFormats[cacheKey]) dateFormats[cacheKey] = new Intl.DateTimeFormat(INTL_LOCALES[locale], options);
	return dateFormats[cacheKey].format(date);
};

const relativeFormats: Partial<Record<AppLocale, Intl.RelativeTimeFormat>> = {};
export const formatLocaleRelativeTime = (locale: AppLocale, value: DateInput): string => {
	const date = parseApiDate(value ?? undefined);
	if (!date) return '';
	if (!relativeFormats[locale]) relativeFormats[locale] = new Intl.RelativeTimeFormat(INTL_LOCALES[locale], { numeric: 'auto' });
	const formatter = relativeFormats[locale] as Intl.RelativeTimeFormat;
	const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000);
	const found = RELATIVE_UNITS.find(({ seconds }) => Math.abs(diffSeconds) >= seconds);
	if (!found) return formatter.format(0, 'second');
	return formatter.format(Math.trunc(diffSeconds / found.seconds), found.unit);
};

/**
 * Locale of the page currently mounted in the browser. Only for code that runs outside React render
 * (SweetAlert helpers, Apollo links, plain event handlers); components must use `useI18n()`.
 **/
let activeLocale: AppLocale = DEFAULT_LOCALE;
export const getActiveLocale = (): AppLocale => activeLocale;
export const translateActive = (key: string, values?: TranslationValues): string => translate(activeLocale, key, values);
export const translateActiveError = (error: unknown, fallbackKey?: string): string => translateError(activeLocale, error, fallbackKey);

interface I18nContextValue {
	locale: AppLocale;
	t: (key: string, values?: TranslationValues) => string;
	/** Like `t`, but placeholders may be React nodes (links, emphasised numbers) **/
	tx: (key: string, nodes: Record<string, ReactNode>) => ReactNode;
	/** Label for a GraphQL enum value, e.g. `tEnum('propertyType', property.propertyType)` **/
	tEnum: (group: string, value?: string | null) => string;
	/** Label for a stored English value, e.g. `tValue('amenities', 'Air Conditioning')`; unknown values are shown as stored **/
	tValue: (namespace: string, value?: string | null) => string;
	/** Text for a caught error: translated API message, or the fallback key when the error carries no message **/
	tError: (error: unknown, fallbackKey?: string) => string;
	formatNumber: (value?: number | null, options?: Intl.NumberFormatOptions) => string;
	formatDate: (value: DateInput, format?: DatePreset | Intl.DateTimeFormatOptions) => string;
	formatRelativeTime: (value: DateInput) => string;
	changeLocale: (locale: AppLocale) => Promise<boolean>;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
	const router = useRouter();
	const locale: AppLocale = isAppLocale(router.locale) ? router.locale : DEFAULT_LOCALE;
	if (typeof window !== 'undefined') activeLocale = locale;

	/** The cookie is read by `middleware.ts`, so the saved language is applied on the server without an English first paint **/
	const changeLocale = useCallback(async (nextLocale: AppLocale): Promise<boolean> => {
		if (typeof window !== 'undefined') {
			document.cookie = `${LOCALE_COOKIE}=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
		}
		return router.push({ pathname: router.pathname, query: router.query }, undefined, { locale: nextLocale, scroll: false });
	}, [router]);

	const value = useMemo<I18nContextValue>(() => ({
		locale,
		t: (key, values) => translate(locale, key, values),
		tx: (key, nodes) => {
			const count = nodes.count;
			return renderRich(resolveMessage(locale, key, typeof count === 'number' ? count : undefined) ?? key, nodes);
		},
		tEnum: (group, enumValue) => translateEnum(locale, group, enumValue),
		tValue: (namespace, storedValue) => translateValue(locale, namespace, storedValue),
		tError: (error, fallbackKey) => translateError(locale, error, fallbackKey),
		formatNumber: (number, options) => formatLocaleNumber(locale, number, options),
		formatDate: (date, format) => formatLocaleDate(locale, date, format),
		formatRelativeTime: (date) => formatLocaleRelativeTime(locale, date),
		changeLocale,
	}), [changeLocale, locale]);

	return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextValue => {
	const context = useContext(I18nContext);
	if (!context) throw new Error('useI18n must be used inside I18nProvider');
	return context;
};
