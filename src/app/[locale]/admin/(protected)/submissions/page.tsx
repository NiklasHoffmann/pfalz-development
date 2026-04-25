import { AdminShell } from '@/components/admin/AdminShell';
import { requireStaffPageAccess } from '@/lib/auth/admin-session';
import { SubmissionsAdminSection } from '@/components/admin/SubmissionsAdminSection';

interface AdminSubmissionsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminSubmissionsPage({
  params,
}: AdminSubmissionsPageProps) {
  const { locale } = await params;
  const staffUser = await requireStaffPageAccess(locale, ['admin', 'editor']);

  return (
    <AdminShell
      locale={locale}
      staffUser={{
        name: staffUser.name,
        email: staffUser.email,
        role: staffUser.role,
      }}
    >
      <SubmissionsAdminSection
        locale={locale}
        canExport={staffUser.role === 'admin'}
      />
    </AdminShell>
  );
}
