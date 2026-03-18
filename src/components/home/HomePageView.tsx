import { HomeAudienceSection } from './HomeAudienceSection';
import { HomeContactSection } from './HomeContactSection';
import { HomeFooter } from './HomeFooter';
import { HomeHeader } from './HomeHeader';
import { HomeHeroSection } from './HomeHeroSection';
import { HomeMobileDock } from './HomeMobileDock';
import { HomePackagesSection } from './HomePackagesSection';
import { HomeProcessFaqSection } from './HomeProcessFaqSection';
import { HomeServicesSection } from './HomeServicesSection';
import type { HomePageData } from './types';

interface HomePageViewProps {
  data: HomePageData;
}

export function HomePageView({ data }: HomePageViewProps) {
  return (
    <main className="min-h-screen overflow-x-clip bg-[linear-gradient(180deg,_#fcfbf7_0%,_#f5efe4_38%,_#f8f5ef_100%)] pb-24 text-stone-950 dark:bg-[linear-gradient(180deg,_#2c2623_0%,_#332b26_34%,_#24303d_100%)] dark:text-stone-100 md:pb-0">
      <HomeHeader appName={data.appName} navItems={data.navItems} />
      <HomeMobileDock items={data.mobileNavItems} />
      <HomeHeroSection
        eyebrow={data.hero.eyebrow}
        headline={data.hero.headline}
        subheadline={data.hero.subheadline}
        primaryCta={data.hero.primaryCta}
        secondaryCta={data.hero.secondaryCta}
        trustTitle={data.hero.trustTitle}
        trustItems={data.hero.trustItems}
      />
      <HomeServicesSection
        title={data.services.title}
        items={data.services.items}
      />
      <HomeAudienceSection
        audiencesTitle={data.audiences.title}
        audiences={data.audiences.items}
        whyMeTitle={data.whyMe.title}
        whyMeItems={data.whyMe.items}
      />
      <HomePackagesSection
        title={data.packages.title}
        items={data.packages.items}
      />
      <HomeProcessFaqSection
        processTitle={data.process.title}
        processSteps={data.process.steps}
        faqTitle={data.faq.title}
        faqItems={data.faq.items}
      />
      <HomeContactSection
        navLabel={data.contact.navLabel}
        title={data.contact.title}
        description={data.contact.description}
        primaryCta={data.contact.primaryCta}
        secondaryCta={data.contact.secondaryCta}
        details={data.contact.details}
        form={data.contact.form}
      />
      <HomeFooter
        note={data.footer.note}
        imprintLabel={data.footer.imprintLabel}
        privacyLabel={data.footer.privacyLabel}
      />
    </main>
  );
}
