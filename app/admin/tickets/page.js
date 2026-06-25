import { createAdminClient, isAdminConfigured } from '@/lib/supabase/admin';
import AdminTickets from '@/components/admin/AdminTickets';

export const dynamic = 'force-dynamic';

export default async function AdminTicketsPage() {
  if (!isAdminConfigured()) {
    return <div className="rounded-2xl border border-amber-400/20 bg-amber-500/5 p-8 text-center"><p className="text-sm text-white/55">Service role key required.</p></div>;
  }

  const sb = createAdminClient();
  if (!sb) return null;

  const { data: tickets } = await sb
    .from('support_tickets')
    .select('*')
    .order('created_at', { ascending: false });

  return <AdminTickets tickets={tickets || []} />;
}
