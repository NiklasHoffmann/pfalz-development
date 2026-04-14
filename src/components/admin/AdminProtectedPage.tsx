import { AdminShell } from '@/components/admin/AdminShell';
import { requireStaffPageAccess } from '@/lib/auth/admin-session';
import type { IntakeStaffRole } from '@/types/intake';

interface AdminProtectedPageProps {
  locale: string;
  allowedRoles?: IntakeStaffRole[];
  children: React.ReactNode;
}

export async function AdminProtectedPage({
  locale,
  allowedRoles,
  children,
}: AdminProtectedPageProps) {
  const staffUser = await requireStaffPageAccess(locale, allowedRoles);

  return (
    <AdminShell
      locale={locale}
      staffUser={{
        name: staffUser.name,
        email: staffUser.email,
        role: staffUser.role,
      }}
    >
      {children}
    </AdminShell>
  );
}
