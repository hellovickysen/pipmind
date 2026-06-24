"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateBetaCount } from '@/app/admin/actions';

export default function BetaCountControl() {
  const router = useRouter();
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  async function submit(e) {
    e.preventDefault();
    if (!value) return;
    setBusy(true);
    setMsg(null);
    const res = await updateBetaCount(value);
    if (res.error) {
      setMsg({ type: 'error', text: res.error });
    } else {
      setMsg({ type: 'ok', text: `Beta count updated to ${res.count}` });
      setValue('');
      router.refresh();
    }
    setBusy(false);
  }

  return (
    <div className="mb-8 rounded-2xl border border-cyan-400/15 bg-cyan-500/[0.03] p-5">
      <div className="mb-3 font-display text-sm font-semibold" style={{ background: 'linear-gradient(120deg,#a78bfa,#22d3ee)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
        Beta Counter Control
      </div>
      <p className="mb-3 text-xs text-white/50">
        Update the beta spots counter shown on the landing page. Current visitors see &ldquo;X / 500 traders joined&rdquo;.
      </p>
      <form onSubmit={submit} className="flex items-center gap-3">
        <input
          type="number"
          min="0"
          max="500"
          placeholder="New count (0-500)"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-48 rounded-lg border border-white/15 bg-black/30 px-3 py-2 font-mono text-sm text-white placeholder:text-white/30 focus:border-cyan-400/40 focus:outline-none"
        />
        <button
          type="submit"
          disabled={busy || !value}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-[#08080f] disabled:opacity-50"
          style={{ background: 'linear-gradient(120deg,#a78bfa,#22d3ee)' }}
        >
          {busy ? 'Updating…' : 'Update'}
        </button>
      </form>
      {msg && (
        <p className={`mt-2 text-xs ${msg.type === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
          {msg.text}
        </p>
      )}
    </div>
  );
}
