import { getTranslations } from 'next-intl/server';
import { HomeMobileDock } from '@/components/home/HomeMobileDock';
import { getMobileDockItems, getMobileNavigationLabel } from '@/lib/locale-ui';

interface LocaleMobileDockProps {
  locale: string;
}

export async function LocaleMobileDock({ locale }: LocaleMobileDockProps) {
  const navT = await getTranslations({ locale, namespace: 'navigation' });

  return (
    <HomeMobileDock
      items={getMobileDockItems(locale, {
        home: navT('home'),
        about: navT('about'),
        contact: navT('contact'),
      })}
      ariaLabel={getMobileNavigationLabel(locale)}
    />
  );
}