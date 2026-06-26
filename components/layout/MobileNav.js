"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { label: 'Dashboard', icon: '▦', href: '/dashboard' },
  { label: 'Trades',    icon: '☰', href: '/dashboard/trades' },
  { label: 'Rulebook',  icon: '📋', href: '/dashboard/rulebook' },
  { label: 'Calendar',  icon: '📅', href: '/dashboard/calendar' },
  { label: 'Expenses',  icon: '💳', href: '/dashboard/expenses' },
  { label: 'Trophies',  icon: '🏆', href: '/dashboard/trophies' },
  { label: 'AI Coach',  icon: '✦', href: '/dashboard/coach' },
  { label: 'Referrals', icon: '🔗', href: '/dashboard/referrals' },
  { label: 'Feedback',  icon: '💬', href: '/dashboard/support' },
  { label: 'Notifications', icon: '🔔', href: '/dashboard/notifications' },
  { label: 'Settings',  icon: '⚙', href: '/dashboard/settings' },
];

export default function MobileNav({ email, avatarUrl, isAdmin, adminNotifCount = 0, credits }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef(null);

  /* close on outside click */
  useEffect(() => {
    if (!open) return;
    function handle(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    document.addEventListener('touchstart', handle);
    return () => {
      document.removeEventListener('mousedown', handle);
      document.removeEventListener('touchstart', handle);
    };
  }, [open]);

  /* prevent body scroll when open */
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const initial = email ? email.charAt(0).toUpperCase() : '?';

  function isActive(href) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <div className="sm:hidden">
      <button onClick={() => setOpen((o) => !o)} aria-label="Menu" className="grid h-11 w-11 place-items-center rounded-lg border border-white/10 bg-white/5 text-lg text-white/70">&#9776;</button>
      {open ? (
        <>
          <div className="fixed inset-0 z-30 bg-black/50" onClick={() => setOpen(false)} />
          <div ref={menuRef} className="absolute left-0 right-0 top-full z-40 border-b border-white/10 bg-[#0b0b14] shadow-xl max-h-[calc(100dvh-4rem)] overflow-y-auto">
            {/* New Trade button */}
            <div className="px-3 pt-3">
              <Link
                href="/dashboard/trades/new"
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-2.5 text-center text-sm font-semibold text-[#08080f]"
                style={{ background: 'linear-gradient(120deg,#a78bfa,#22d3ee)' }}
              >
                + New Trade
              </Link>
            </div>

            {/* Nav links */}
            <nav className="flex flex-col gap-0.5 px-3 py-2">
              {LINKS.map((l) => {
                const active = isActive(l.href);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={'flex items-center gap-2.5 rounded-xl px-3 py-3 text-sm transition-all ' + (active ? 'bg-white/[0.08] font-semibold text-white' : 'text-white/70 hover:bg-white/5 hover:text-white')}
                  >
                    <span className="w-5 text-center text-sm">{l.icon}</span>
                    <span>{l.label}</span>
                    {active && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full" style={{ background: 'linear-gradient(135deg,#a78bfa,#22d3ee)' }} />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Bottom section */}
            <div className="border-t border-white/[0.06] px-3 py-3">
              {/* Credits */}
              {credits != null && (
                <Link
                  href="/dashboard/referrals"
                  onClick={() => setOpen(false)}
                  className="mb-2 flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2.5 transition-colors hover:bg-white/[0.08]"
                >
                  <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">Credits</span>
                  <span className="font-display text-sm font-bold text-emerald-400">${Number(credits).toFixed(2)}</span>
                </Link>
              )}

              {/* Admin Panel */}
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="mb-2 flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold transition-colors hover:bg-white/[0.08]"
                  style={{ background: 'linear-gradient(120deg, rgba(248,113,113,0.1), rgba(251,191,36,0.1))', border: '1px solid rgba(248,113,113,0.2)' }}
                >
                  <span>&#9881;</span>
                  <span className="text-amber-300">Admin Panel</span>
                  {adminNotifCount > 0 ? (
                    <span
                      className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-[#08080f]"
                      style={{ background: 'linear-gradient(135deg,#f87171,#fbbf24)' }}
                    >
                      {adminNotifCount}
                    </span>
                  ) : (
                    <span
                      className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white/40"
                      style={{ background: 'rgba(255,255,255,0.1)' }}
                    >
                      0
                    </span>
                  )}
                </Link>
              )}

              {/* User row */}
              <div className="mb-2 flex items-center gap-2.5 px-3 py-2">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="h-8 w-8 flex-shrink-0 rounded-full object-cover border border-white/10" />
                ) : (
                  <div
                    className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full text-sm font-bold text-[#08080f]"
                    style={{ background: 'linear-gradient(135deg,#a78bfa,#22d3ee)' }}
                  >
                    {initial}
                  </div>
                )}
                <span className="truncate font-mono text-xs text-white/50">{email || 'Account'}</span>
              </div>

              {/* Sign out */}
              <form action="/auth/signout" method="post">
                <button className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3 text-left text-sm text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white">
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
