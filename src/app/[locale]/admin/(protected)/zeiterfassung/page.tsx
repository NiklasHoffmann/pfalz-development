import { AdminProtectedPage } from '@/components/admin/AdminProtectedPage';
import { TimeTrackingAdminSection } from '@/components/admin/TimeTrackingAdminSection';

interface AdminZeiterfassungPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminZeiterfassungPage({
  params,
}: AdminZeiterfassungPageProps) {
  const { locale } = await params;

  return (
    <AdminProtectedPage locale={locale}>
      <TimeTrackingAdminSection />
    </AdminProtectedPage>
  );
}
