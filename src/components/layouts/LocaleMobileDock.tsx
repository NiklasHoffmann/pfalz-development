'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { HomeMobileDock } from '@/components/home/HomeMobileDock';
import {
  getContactRevealEventName,
  readContactRevealUnlocked,
} from '@/lib/contact-reveal';
import { isInternalIntakePath } from '@/lib/intake/path';
import {
  getDockLogicalPath,
  getMobileDockItems,
  getMobileNavigationLabel,
  getNavigationLabels,
} from '@/lib/locale-ui';

interface LocaleMobileDockProps {
  locale: string;
}

function shouldHideMobileDock(pathname: string): boolean {
  return (
    pathname === '/impressum' ||
    pathname === '/datenschutz' ||
    isInternalIntakePath(pathname)
  );
}

export function LocaleMobileDock({ locale }: LocaleMobileDockProps) {
  const pathname = usePathname();
  const [hash, setHash] = useState('');
  const [activeHrefOverride, setActiveHrefOverride] = useState<string>();
  const [hasUnlockedContact, setHasUnlockedContact] = useState(false);
  const logicalPathname = getDockLogicalPath(pathname);
  const items = getMobileDockItems(locale, getNavigationLabels(locale), {
    hasUnlockedContact,
  });
  const homeItemHref = items.find((item) => !item.href.includes('#'))?.href;
  const resolvedActiveHrefOverride =
    logicalPathname === '/' ? (activeHrefOverride ?? homeItemHref) : undefined;

  useEffect(() => {
    const updateContactState = () => {
      setHasUnlockedContact(readContactRevealUnlocked());
    };

    const handleContactRevealChange = () => {
      updateContactState();
    };

    updateContactState();
    window.addEventListener(
      getContactRevealEventName(),
      handleContactRevealChange
    );

    return () => {
      window.removeEventListener(
        getContactRevealEventName(),
        handleContactRevealChange
      );
    };
  }, []);

  useEffect(() => {
    if (logicalPathname !== '/') {
      return;
    }

    const homeItem = items.find((item) => !item.href.includes('#'));
    const whatsAppItem = items.find((item) => item.variant === 'whatsapp');

    if (!homeItem || !whatsAppItem) {
      return;
    }

    const updateActiveSection = () => {
      const contactSection = document.getElementById('kontakt');
      if (!contactSection) {
        setActiveHrefOverride(homeItem.href);
        return;
      }

      const rect = contactSection.getBoundingClientRect();
      const midLine = window.innerHeight * 0.5;
      const isContactActive = rect.top <= midLine && rect.bottom >= midLine;

      setActiveHrefOverride(
        isContactActive ? whatsAppItem.href : homeItem.href
      );
    };

    updateActiveSection();
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    window.addEventListener('resize', updateActiveSection);

    return () => {
      window.removeEventListener('scroll', updateActiveSection);
      window.removeEventListener('resize', updateActiveSection);
    };
  }, [items, logicalPathname]);

  useEffect(() => {
    const updateHash = () => {
      setHash(window.location.hash);
    };

    updateHash();
    window.addEventListener('hashchange', updateHash);

    return () => {
      window.removeEventListener('hashchange', updateHash);
    };
  }, []);

  if (shouldHideMobileDock(logicalPathname)) {
    return null;
  }

  return (
    <HomeMobileDock
      items={items}
      ariaLabel={getMobileNavigationLabel(locale)}
      currentPathname={logicalPathname}
      currentHash={hash}
      activeHrefOverride={resolvedActiveHrefOverride}
    />
  );
}
