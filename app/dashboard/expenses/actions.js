"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

function sanitize(str, maxLen) {
  if (!str) return null;
  return String(str).slice(0, maxLen).replace(/<[^>]*>/g, '').trim();
}

function toNum(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

async function getCtx() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

const VALID_ACCOUNT_TYPES = ['futures', 'cfd'];
const VALID_PURCHASE_TYPES = ['new', 'renewal', 'activation'];

export async function createExpense(payload) {
  const { supabase, user } = await getCtx();
  if (!user) return { error: 'Not signed in.' };

  const firmName = sanitize(payload.firm_name, 100);
  if (!firmName) return { error: 'Firm name is required.' };

  const totalCost = toNum(payload.total_cost);
  if (totalCost === null || totalCost <= 0) return { error: 'Total cost is required.' };

  const { error } = await supabase.from('expenses').insert({
    user_id: user.id,
    firm_name: firmName,
    account_type: VALID_ACCOUNT_TYPES.includes(payload.account_type) ? payload.account_type : null,
    account_size: sanitize(payload.account_size, 20),
    purchase_type: VALID_PURCHASE_TYPES.includes(payload.purchase_type) ? payload.purchase_type : null,
    account_cost: toNum(payload.account_cost),
    num_accounts: Math.max(1, Math.min(toNum(payload.num_accounts) || 1, 100)),
    total_cost: totalCost,
    expense_date: payload.expense_date || null,
    notes: sanitize(payload.notes, 500),
  });

  if (error) return { error: error.message };
  revalidatePath('/dashboard/expenses');
  revalidatePath('/dashboard');
  return { ok: true };
}

export async function deleteExpense(id) {
  const { supabase, user } = await getCtx();
  if (!user) return { error: 'Not signed in.' };
  const { error } = await supabase.from('expenses').delete().eq('id', id).eq('user_id', user.id);
  if (error) return { error: error.message };
  revalidatePath('/dashboard/expenses');
  revalidatePath('/dashboard');
  return { ok: true };
}

export async function createPayout(payload) {
  const { supabase, user } = await getCtx();
  if (!user) return { error: 'Not signed in.' };

  const firmName = sanitize(payload.firm_name, 100);
  if (!firmName) return { error: 'Firm name is required.' };

  const amount = toNum(payload.amount);
  if (amount === null || amount <= 0) return { error: 'Amount is required.' };

  const { error } = await supabase.from('payouts').insert({
    user_id: user.id,
    firm_name: firmName,
    amount,
    payout_date: payload.payout_date || null,
    notes: sanitize(payload.notes, 500),
  });

  if (error) return { error: error.message };
  revalidatePath('/dashboard/expenses');
  revalidatePath('/dashboard');
  return { ok: true };
}

export async function deletePayout(id) {
  const { supabase, user } = await getCtx();
  if (!user) return { error: 'Not signed in.' };
  const { error } = await supabase.from('payouts').delete().eq('id', id).eq('user_id', user.id);
  if (error) return { error: error.message };
  revalidatePath('/dashboard/expenses');
  revalidatePath('/dashboard');
  return { ok: true };
}
