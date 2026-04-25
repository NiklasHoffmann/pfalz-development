import { FormsAdminSection } from '@/components/admin/FormsAdminSection';
import { AdminProtectedPage } from '@/components/admin/AdminProtectedPage';

interface AdminFormsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminFormsPage({ params }: AdminFormsPageProps) {
  const { locale } = await params;

  return (
    <AdminProtectedPage locale={locale} allowedRoles={['admin']}>
      <FormsAdminSection locale={locale} />
    </AdminProtectedPage>
  );
}