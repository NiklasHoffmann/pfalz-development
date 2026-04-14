import { localeToPathPrefix } from '@/lib/seo';
import { INTAKE_INTERNAL_PREFIXES } from './constants';

function normalizePathname(pathname: string): string {
  if (!pathname) {
    return '/';
  }

  const withoutQuery = pathname.split('?')[0] ?? pathname;
  const withoutHash = withoutQuery.split('#')[0] ?? withoutQuery;

  if (withoutHash === '') {
    return '/';
  }

  return withoutHash.endsWith('/') && withoutHash !== '/'
    ? withoutHash.slice(0, -1)
    : withoutHash;
}

export function isInternalIntakePath(pathname: string): boolean {
  const normalizedPathname = normalizePathname(pathname);

  return INTAKE_INTERNAL_PREFIXES.some(
    (prefix) =>
      normalizedPathname === prefix ||
      normalizedPathname.startsWith(`${prefix}/`)
  );
}

export function buildProjectTokenPath(locale: string, token: string): string {
  return `${localeToPathPrefix(locale)}/projekt/${token}`;
}

export function buildProjectSharePath(
  locale: string,
  shareToken: string
): string {
  return `${localeToPathPrefix(locale)}/projekt-link/${shareToken}`;
}

export function buildQuestionnairePath(locale: string, slug: string): string {
  return `${localeToPathPrefix(locale)}/fragebogen/${slug}`;
}

export function buildQuestionnaireCompletePath(
  locale: string,
  slug: string
): string {
  return `${buildQuestionnairePath(locale, slug)}/abschluss`;
}
