import { AdminProtectedPage } from '@/components/admin/AdminProtectedPage';
import { StaffAdminSection } from '@/components/admin/StaffAdminSection';

interface AdminStaffPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminStaffPage({ params }: AdminStaffPageProps) {
  const { locale } = await params;

  return (
    <AdminProtectedPage locale={locale} allowedRoles={['admin']}>
      <StaffAdminSection />
    </AdminProtectedPage>
  );
}