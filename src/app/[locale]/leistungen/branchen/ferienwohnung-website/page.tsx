import { redirect } from 'next/navigation';
import { localeToPathPrefix } from '@/lib/seo';

interface FerienwohnungWebsiteRedirectPageProps {
  params: Promise<{ locale: string }>;
}

export default async function FerienwohnungWebsiteRedirectPage({
  params,
}: FerienwohnungWebsiteRedirectPageProps) {
  const { locale } = await params;
  const target = `${localeToPathPrefix(locale)}/branchen/ferienwohnung-website`;

  redirect(target);
}