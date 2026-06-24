import { createClient } from '@/lib/supabase/server';
import ReferralDashboard from '@/components/referrals/ReferralDashboard';

export const dynamic = 'force-dynamic';

export default async function ReferralsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get referral code
  const { data: refCode } = await supabase
    .from('referral_codes')
    .select('code')
    .eq('user_id', user.id)
    .maybeSingle();

  // Get referrals made by this user
  const { data: referrals } = await supabase
    .from('referrals')
    .select('*')
    .eq('referrer_id', user.id)
    .order('created_at', { ascending: false });

  // Get balance
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('referral_balance')
    .eq('user_id', user.id)
    .maybeSingle();

  return (
    <ReferralDashboard
      code={refCode?.code || null}
      referrals={referrals || []}
      balance={prefs?.referral_balance || 0}
    />
  );
}
