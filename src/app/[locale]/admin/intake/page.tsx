import { redirect } from 'next/navigation';
import { AdminProtectedPage } from '@/components/admin/AdminProtectedPage';

interface AdminIntakeIndexPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminIntakeIndexPage({
  params,
}: AdminIntakeIndexPageProps) {
  const { locale } = await params;

  return (
    <AdminProtectedPage locale={locale} allowedRoles={['admin', 'editor']}>
      {redirect(
        locale === 'de'
          ? '/admin/intake/submissions'
          : `/${locale}/admin/intake/submissions`
      )}
    </AdminProtectedPage>
  );
}
