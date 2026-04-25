import { AdminProtectedPage } from '@/components/admin/AdminProtectedPage';
import { FormDetailAdminSection } from '@/components/admin/FormDetailAdminSection';

interface AdminFormDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function AdminFormDetailPage({
  params,
}: AdminFormDetailPageProps) {
  const { locale, id } = await params;

  return (
    <AdminProtectedPage locale={locale} allowedRoles={['admin']}>
      <FormDetailAdminSection formId={id} locale={locale} />
    </AdminProtectedPage>
  );
}