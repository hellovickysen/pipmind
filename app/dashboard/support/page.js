import { createClient } from '@/lib/supabase/server';
import SupportPage from '@/components/support/SupportPage';

export const dynamic = 'force-dynamic';

export default async function SupportRoute() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: tickets } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return <SupportPage tickets={tickets || []} />;
}
