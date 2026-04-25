import { AuditLogsAdminSection } from '@/components/admin/AuditLogsAdminSection';
import { AdminProtectedPage } from '@/components/admin/AdminProtectedPage';

interface AdminAuditLogsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminAuditLogsPage({
  params,
}: AdminAuditLogsPageProps) {
  const { locale } = await params;

  return (
    <AdminProtectedPage locale={locale} allowedRoles={['admin']}>
      <AuditLogsAdminSection />
    </AdminProtectedPage>
  );
}