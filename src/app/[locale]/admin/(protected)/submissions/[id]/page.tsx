import { AdminShell } from '@/components/admin/AdminShell';
import { requireStaffPageAccess } from '@/lib/auth/admin-session';
import { SubmissionDetailAdminSection } from '@/components/admin/SubmissionDetailAdminSection';

interface AdminSubmissionDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function AdminSubmissionDetailPage({
  params,
}: AdminSubmissionDetailPageProps) {
  const { locale, id } = await params;
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
      <SubmissionDetailAdminSection
        submissionId={id}
        locale={locale}
        canPrint={staffUser.role === 'admin'}
      />
    </AdminShell>
  );
}