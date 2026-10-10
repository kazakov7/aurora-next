import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * i18n dictionary check.
 *   node scripts/check-i18n.mjs            parity, placeholders and keys missing from en.json (fails on any)
 *   node scripts/check-i18n.mjs --unused   additionally fails when a dictionary key is never referenced
 **/
const root = fileURLToPath(new URL('..', import.meta.url));
const locales = ['en', 'ko', 'uz'];
const strictUnused = process.argv.includes('--unused');
const PLURAL_SUFFIX = /_(zero|one|two|few|many|other)$/;
/** Namespaces whose keys are built at runtime (`enums.<group>.<VALUE>` and similar) **/
const DYNAMIC_NAMESPACES = ['enums.', 'serverErrors.', 'amenities.', 'common.pagination.'];

const load = (locale) => JSON.parse(readFileSync(join(root, 'libs/i18n/messages', `${locale}.json`), 'utf8'));
const flatten = (value, prefix = '') => Object.entries(value).flatMap(([key, child]) => {
	const path = prefix ? `${prefix}.${key}` : key;
	return typeof child === 'string' ? [[path, child]] : flatten(child, path);
});
const baseKey = (key) => key.replace(PLURAL_SUFFIX, '');
const placeholders = (text) => [...new Set(text.match(/\{\{\w+\}\}/g) ?? [])].sort().join(',');

const entries = Object.fromEntries(locales.map((locale) => [locale, new Map(flatten(load(locale)))]));
const baseSets = Object.fromEntries(locales.map((locale) => [locale, new Set([...entries[locale].keys()].map(baseKey))]));
const reference = baseSets.en;
const errors = [];

/** Parity is compared on base keys: a locale without plural forms does not need `key_one` **/
for (const locale of locales.slice(1)) {
	const missing = [...reference].filter((key) => !baseSets[locale].has(key));
	const extra = [...baseSets[locale]].filter((key) => !reference.has(key));
	if (missing.length) errors.push(`${locale}: missing ${missing.length} key(s): ${missing.slice(0, 40).join(', ')}`);
	if (extra.length) errors.push(`${locale}: ${extra.length} key(s) not in en: ${extra.slice(0, 40).join(', ')}`);
}

/** A translation must keep every placeholder of the English message it replaces **/
for (const locale of locales.slice(1)) {
	for (const [key, text] of entries[locale]) {
		const source = entries.en.get(key) ?? entries.en.get(baseKey(key)) ?? entries.en.get(`${baseKey(key)}_other`);
		if (source !== undefined && placeholders(source) !== placeholders(text)) {
			errors.push(`${locale}: placeholders differ for ${key} (en: ${placeholders(source) || 'none'}, ${locale}: ${placeholders(text) || 'none'})`);
		}
	}
}

const sourceFiles = [];
const walk = (dir) => {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) walk(full);
		else if (/\.(tsx?|jsx?)$/.test(entry.name)) sourceFiles.push(full);
	}
};
['pages', 'libs', 'apollo'].forEach((dir) => walk(join(root, dir)));

/** Every dotted string literal in the source is a potential key; the ones passed to a translator must exist **/
const literals = new Set();
const called = new Map();
for (const file of sourceFiles) {
	const source = readFileSync(file, 'utf8');
	for (const match of source.matchAll(/['"`]([A-Za-z][\w]*(?:\.[\w]+)+)['"`]/g)) literals.add(match[1]);
	for (const match of source.matchAll(/\b(?:t|tx|translateActive)\(\s*['"`]([A-Za-z][\w]*(?:\.[\w]+)+)['"`]/g)) {
		if (!called.has(match[1])) called.set(match[1], file.slice(root.length));
	}
}

const missingInDictionary = [...called].filter(([key]) => !reference.has(key));
if (missingInDictionary.length) {
	errors.push(`keys used in code but missing from en.json: ${missingInDictionary.map(([key, file]) => `${key} (${file})`).slice(0, 40).join(', ')}`);
}

const unused = [...reference].filter((key) => !literals.has(key) && !DYNAMIC_NAMESPACES.some((namespace) => key.startsWith(namespace)));

if (errors.length) {
	errors.forEach((message) => console.error(message));
	process.exit(1);
}
if (unused.length) {
	console[strictUnused ? 'error' : 'warn'](`${unused.length} key(s) are never referenced: ${unused.slice(0, 60).join(', ')}${unused.length > 60 ? ', …' : ''}`);
	if (strictUnused) process.exit(1);
}
console.log(`i18n dictionaries verified: ${reference.size} keys across ${locales.join(', ')}`);
