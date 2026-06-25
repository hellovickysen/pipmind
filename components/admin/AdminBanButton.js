"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { banUser, unbanUser } from '@/app/admin/actions';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function AdminBanButton({ userId, isBanned, email }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [showUnbanConfirm, setShowUnbanConfirm] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleBan() {
    if (!reason.trim()) return;
    setLoading(true);
    const res = await banUser(userId, reason.trim());
    if (res.error) alert('Error: ' + res.error);
    setLoading(false);
    setShowModal(false);
    setReason('');
    router.refresh();
  }

  async function handleUnban() {
    setShowUnbanConfirm(false);
    setLoading(true);
    const res = await unbanUser(userId);
    if (res.error) alert('Error: ' + res.error);
    setLoading(false);
    router.refresh();
  }

  if (isBanned) {
    return (
      <>
        <button
          onClick={() => setShowUnbanConfirm(true)}
          disabled={loading}
          className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50"
        >
          {loading ? '...' : 'Unban'}
        </button>

        <ConfirmDialog
          open={showUnbanConfirm}
          onClose={() => setShowUnbanConfirm(false)}
          onConfirm={handleUnban}
          title={`Unban ${email}?`}
          message="They will be able to log in again."
          confirmLabel="Unban"
        />
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="rounded-lg border border-red-400/30 bg-red-500/10 px-2.5 py-1 text-[10px] font-semibold text-red-300 hover:bg-red-500/20"
      >
        Ban
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#12121a] p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg font-bold text-red-300">Ban User</h3>
            <p className="mt-1 text-sm text-white/55">{email}</p>

            <div className="mt-4">
              <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-white/50">Reason for ban</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-white/10 bg-black/30 px-3.5 py-2.5 text-sm outline-none focus:border-red-400/60"
                placeholder="e.g. Spamming, abusive content, TOS violation..."
                autoFocus
              />
            </div>

            <p className="mt-3 text-xs text-white/40">This will immediately revoke their access. They won't be able to log in until unbanned.</p>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => { setShowModal(false); setReason(''); }}
                className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/70"
              >
                Cancel
              </button>
              <button
                onClick={handleBan}
                disabled={loading || !reason.trim()}
                className="flex-1 rounded-xl bg-red-500/20 px-4 py-2.5 text-sm font-semibold text-red-300 disabled:opacity-50"
              >
                {loading ? 'Banning...' : 'Confirm Ban'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
