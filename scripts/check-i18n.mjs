import { readFileSync } from 'node:fs';

const locales = ['en', 'ko', 'uz'];
const load = (locale) => JSON.parse(readFileSync(new URL(`../libs/i18n/messages/${locale}.json`, import.meta.url), 'utf8'));
const flatten = (value, prefix = '') => Object.entries(value).flatMap(([key, child]) => {
	const path = prefix ? `${prefix}.${key}` : key;
	return typeof child === 'string' ? [path] : flatten(child, path);
});

const keySets = Object.fromEntries(locales.map((locale) => [locale, new Set(flatten(load(locale)))]));
const reference = keySets.en;
let invalid = false;

for (const locale of locales.slice(1)) {
	const missing = [...reference].filter((key) => !keySets[locale].has(key));
	const extra = [...keySets[locale]].filter((key) => !reference.has(key));
	if (missing.length || extra.length) {
		invalid = true;
		console.error(`${locale}: missing [${missing.join(', ')}], extra [${extra.join(', ')}]`);
	}
}

if (invalid) process.exit(1);
console.log(`i18n dictionaries verified: ${reference.size} keys across ${locales.join(', ')}`);
