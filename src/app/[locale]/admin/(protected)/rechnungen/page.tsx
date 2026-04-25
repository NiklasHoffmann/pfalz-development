import { AdminShell } from '@/components/admin/AdminShell';
import { InvoicesAdminSection } from '@/components/admin/InvoicesAdminSection';
import { requireStaffPageAccess } from '@/lib/auth/admin-session';

interface AdminInvoicesPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminInvoicesPage({
  params,
}: AdminInvoicesPageProps) {
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
      <InvoicesAdminSection locale={locale} />
    </AdminShell>
  );
}