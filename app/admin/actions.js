"use server";

import { createClient } from '@/lib/supabase/server';
import { createAdminClient, ADMIN_EMAIL } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

async function verifyAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) return { error: 'Unauthorized.' };
  return { user };
}

export async function banUser(userId, reason) {
  const auth = await verifyAdmin();
  if (auth.error) return auth;

  const sb = createAdminClient();
  if (!sb) return { error: 'Admin client unavailable.' };

  const { error } = await sb.auth.admin.updateUserById(userId, {
    ban_duration: '876000h',
    user_metadata: { ban_reason: reason || 'No reason provided', banned_at: new Date().toISOString() },
  });
  if (error) return { error: error.message };

  revalidatePath('/admin/users');
  return { ok: true };
}

export async function updateBetaCount(newCount) {
  const auth = await verifyAdmin();
  if (auth.error) return auth;

  const count = parseInt(newCount, 10);
  if (isNaN(count) || count < 0 || count > 500) return { error: 'Count must be 0-500.' };

  const supabase = createClient();
  const { error } = await supabase
    .from('site_settings')
    .upsert({ key: 'beta_count', value: String(count), updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) return { error: error.message };

  revalidatePath('/');
  revalidatePath('/admin');
  return { ok: true, count };
}

export async function unbanUser(userId) {
  const auth = await verifyAdmin();
  if (auth.error) return auth;

  const sb = createAdminClient();
  if (!sb) return { error: 'Admin client unavailable.' };

  const { error } = await sb.auth.admin.updateUserById(userId, {
    ban_duration: 'none',
    user_metadata: { ban_reason: null, banned_at: null },
  });
  if (error) return { error: error.message };

  revalidatePath('/admin/users');
  return { ok: true };
}
