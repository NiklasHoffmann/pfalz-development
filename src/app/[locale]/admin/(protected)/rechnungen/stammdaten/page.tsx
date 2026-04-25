import { AdminShell } from '@/components/admin/AdminShell';
import { InvoiceSettingsAdminSection } from '@/components/admin/InvoiceSettingsAdminSection';
import { requireStaffPageAccess } from '@/lib/auth/admin-session';

interface AdminInvoiceSettingsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminInvoiceSettingsPage({
  params,
}: AdminInvoiceSettingsPageProps) {
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
      <InvoiceSettingsAdminSection locale={locale} />
    </AdminShell>
  );
}
