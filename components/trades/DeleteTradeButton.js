"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteTrade } from '@/app/dashboard/trades/actions';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function DeleteTradeButton({ tradeId }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function onConfirmDelete() {
    setShowConfirm(false);
    setBusy(true);
    const res = await deleteTrade(tradeId);
    if (res && res.error) {
      window.alert(res.error);
      setBusy(false);
    } else {
      router.push('/dashboard/trades');
      router.refresh();
    }
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={busy}
        className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/20 disabled:opacity-60"
      >
        {busy ? 'Deleting...' : 'Delete'}
      </button>

      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={onConfirmDelete}
        title="Delete this trade?"
        message="This action can't be undone. The trade and its journal entry will be permanently removed."
      />
    </>
  );
}
