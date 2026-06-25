"use server";

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { ADMIN_EMAIL } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) throw new Error('Unauthorized');
  return user;
}

export async function updateTicketStatus(ticketId, status) {
  await requireAdmin();
  const sb = createAdminClient();
  if (!sb) return { error: 'Admin client not configured.' };

  const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
  if (!validStatuses.includes(status)) return { error: 'Invalid status.' };

  const { error } = await sb
    .from('support_tickets')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', ticketId);

  if (error) return { error: error.message };
  revalidatePath('/admin/tickets');
  return { ok: true };
}

export async function replyToTicket(ticketId, reply) {
  await requireAdmin();
  const sb = createAdminClient();
  if (!sb) return { error: 'Admin client not configured.' };

  if (!reply || !reply.trim()) return { error: 'Reply cannot be empty.' };

  const { error } = await sb
    .from('support_tickets')
    .update({
      admin_reply: reply.trim().slice(0, 5000),
      status: 'in_progress',
      updated_at: new Date().toISOString(),
    })
    .eq('id', ticketId);

  if (error) return { error: error.message };
  revalidatePath('/admin/tickets');
  revalidatePath('/dashboard/support');
  return { ok: true };
}
