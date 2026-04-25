import { AccessLinksAdminSection } from '@/components/admin/AccessLinksAdminSection';
import { AdminProtectedPage } from '@/components/admin/AdminProtectedPage';

interface AdminAccessLinksPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminAccessLinksPage({
  params,
}: AdminAccessLinksPageProps) {
  const { locale } = await params;

  return (
    <AdminProtectedPage locale={locale} allowedRoles={['admin']}>
      <AccessLinksAdminSection />
    </AdminProtectedPage>
  );
}