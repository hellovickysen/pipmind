"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

async function getCtx() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

/* ── Fetch paginated notifications ───────────────────────── */
export async function getNotifications(limit = 20, offset = 0) {
  const { supabase, user } = await getCtx();
  if (!user) return { error: 'Not signed in.' };

  const { data, error, count } = await supabase
    .from('notifications')
    .select('id, type, title, message, is_read, metadata, created_at', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return { error: error.message };
  return { data, total: count };
}

/* ── Unread count (lightweight) ──────────────────────────── */
export async function getUnreadCount() {
  const { supabase, user } = await getCtx();
  if (!user) return { count: 0 };

  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  if (error) return { count: 0 };
  return { count: count || 0 };
}

/* ── Mark ALL as read ────────────────────────────────────── */
export async function markAllAsRead() {
  const { supabase, user } = await getCtx();
  if (!user) return { error: 'Not signed in.' };

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  if (error) return { error: error.message };
  revalidatePath('/dashboard');
  return { ok: true };
}

/* ── Mark single notification as read ────────────────────── */
export async function markAsRead(notificationId) {
  const { supabase, user } = await getCtx();
  if (!user) return { error: 'Not signed in.' };

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', user.id);

  if (error) return { error: error.message };
  return { ok: true };
}

/* ── Delete a notification ───────────────────────────────── */
export async function deleteNotification(notificationId) {
  const { supabase, user } = await getCtx();
  if (!user) return { error: 'Not signed in.' };

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)
    .eq('user_id', user.id);

  if (error) return { error: error.message };
  return { ok: true };
}

/* ── Clear all notifications ─────────────────────────────── */
export async function clearAllNotifications() {
  const { supabase, user } = await getCtx();
  if (!user) return { error: 'Not signed in.' };

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('user_id', user.id);

  if (error) return { error: error.message };
  revalidatePath('/dashboard');
  return { ok: true };
}
