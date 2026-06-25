"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { createTicket } from '@/app/dashboard/support/actions';
import { useToast } from '@/components/ui/Toast';

const field = 'w-full rounded-lg border border-white/10 bg-black/30 px-3.5 py-2.5 text-sm outline-none focus:border-cyan-400/60';
const labelCls = 'mb-1.5 block font-mono text-xs uppercase tracking-wider text-white/55';

const CATEGORIES = [
  { value: 'bug', label: 'Bug Report', icon: '🐛', color: 'border-red-400/30 bg-red-500/15 text-red-300' },
  { value: 'platform_issue', label: 'Platform Issue', icon: '⚠️', color: 'border-amber-400/30 bg-amber-500/15 text-amber-300' },
  { value: 'feature_request', label: 'Feature Request', icon: '💡', color: 'border-cyan-400/30 bg-cyan-500/15 text-cyan-300' },
  { value: 'general_support', label: 'General Support', icon: '💬', color: 'border-violet-400/30 bg-violet-500/15 text-violet-300' },
  { value: 'account_billing', label: 'Account / Billing', icon: '💳', color: 'border-emerald-400/30 bg-emerald-500/15 text-emerald-300' },
];

const STATUS_STYLES = {
  open: 'border-amber-400/30 bg-amber-500/15 text-amber-300',
  in_progress: 'border-cyan-400/30 bg-cyan-500/15 text-cyan-300',
  resolved: 'border-emerald-400/30 bg-emerald-500/15 text-emerald-300',
  closed: 'border-white/10 bg-white/5 text-white/50',
};

const STATUS_LABELS = { open: 'Open', in_progress: 'In Progress', resolved: 'Resolved', closed: 'Closed' };

function getCat(val) {
  return CATEGORIES.find((c) => c.value === val) || CATEGORIES[3];
}

function fmtDate(d) {
  if (!d) return '';
  try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return ''; }
}

/** Get all screenshot URLs from a ticket (handles both old screenshot_url and new screenshot_urls) */
function getScreenshots(ticket) {
  const urls = [];
  if (ticket.screenshot_urls && Array.isArray(ticket.screenshot_urls)) {
    urls.push(...ticket.screenshot_urls);
  }
  if (ticket.screenshot_url && !urls.includes(ticket.screenshot_url)) {
    urls.push(ticket.screenshot_url);
  }
  return urls;
}

export default function SupportPage({ tickets }) {
  const router = useRouter();
  const toast = useToast();
  const fileInputRef = useRef(null);
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState('general_support');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [screenshots, setScreenshots] = useState([]); // [{ url, uploading }]
  const [saving, setSaving] = useState(false);

  async function handleScreenshots(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const supabase = createClient();

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        if (toast) toast.error(file.name + ' is over 5MB — skipped');
        continue;
      }

      // Add placeholder
      const tempId = Date.now() + Math.random();
      setScreenshots((prev) => [...prev, { id: tempId, url: null, uploading: true }]);

      try {
        const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
        const path = 'support/' + Date.now() + '_' + Math.random().toString(36).slice(2, 6) + '.' + ext;
        const { error } = await supabase.storage.from('screenshots').upload(path, file, { cacheControl: '3600', upsert: true });
        if (error) {
          if (toast) toast.error('Upload failed: ' + file.name);
          setScreenshots((prev) => prev.filter((s) => s.id !== tempId));
          continue;
        }
        const { data: { publicUrl } } = supabase.storage.from('screenshots').getPublicUrl(path);
        setScreenshots((prev) => prev.map((s) => s.id === tempId ? { ...s, url: publicUrl, uploading: false } : s));
      } catch {
        if (toast) toast.error('Upload failed: ' + file.name);
        setScreenshots((prev) => prev.filter((s) => s.id !== tempId));
      }
    }

    // Reset input so same files can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removeScreenshot(id) {
    setScreenshots((prev) => prev.filter((s) => s.id !== id));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const urls = screenshots.filter((s) => s.url).map((s) => s.url);
    const res = await createTicket({
      category,
      subject,
      description,
      screenshot_urls: urls,
      screenshot_url: urls[0] || null,
    });
    if (res.error) {
      if (toast) toast.error(res.error);
    } else {
      if (toast) toast.success('Ticket submitted!');
      setShowForm(false);
      setCategory('general_support');
      setSubject('');
      setDescription('');
      setScreenshots([]);
      router.refresh();
    }
    setSaving(false);
  }

  const anyUploading = screenshots.some((s) => s.uploading);

  return (
    <div className="px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Support</h1>
          <p className="mt-1 text-sm text-white/55">Submit a ticket or report an issue</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="rounded-xl px-4 py-2 text-sm font-semibold text-[#08080f]" style={{ background: 'linear-gradient(120deg,#a78bfa,#22d3ee)' }}>
          {showForm ? 'Cancel' : '+ New Ticket'}
        </button>
      </div>

      {/* Submit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
          <h2 className="mb-5 font-display text-base font-semibold">Submit a ticket</h2>

          <div className="space-y-4">
            <div>
              <label className={labelCls}>Category *</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setCategory(c.value)}
                    className={'rounded-lg border px-3 py-2.5 text-xs font-semibold transition-all ' + (category === c.value ? c.color : 'border-white/10 bg-black/30 text-white/50')}
                  >
                    <span className="mr-1">{c.icon}</span> {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>Subject *</label>
              <input
                className={field}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your issue"
                maxLength={200}
                required
              />
            </div>

            <div>
              <label className={labelCls}>Description *</label>
              <textarea
                className={field}
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue in detail. Include steps to reproduce if it's a bug."
                maxLength={5000}
                required
              />
              <p className="mt-1 text-right font-mono text-[10px] text-white/30">{description.length}/5000</p>
            </div>

            <div>
              <label className={labelCls}>Screenshots (optional)</label>

              {/* Previews */}
              {screenshots.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {screenshots.map((s) => (
                    <div key={s.id} className="relative group">
                      {s.uploading ? (
                        <div className="grid h-20 w-24 place-items-center rounded-lg border border-white/10 bg-black/30">
                          <svg className="h-5 w-5 animate-spin text-cyan-400" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="31.4 31.4" />
                          </svg>
                        </div>
                      ) : (
                        <>
                          <img src={s.url} alt="Screenshot" className="h-20 w-24 rounded-lg border border-white/10 object-cover" />
                          <button
                            type="button"
                            onClick={() => removeScreenshot(s.id)}
                            className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-red-500 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            &#10005;
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border border-dashed border-white/15 bg-white/[0.02] px-4 py-3 text-xs text-white/50 transition-colors hover:border-white/30 hover:text-white/70"
              >
                + Add screenshots
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleScreenshots}
                className="hidden"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/70">Cancel</button>
            <button type="submit" disabled={saving || anyUploading} className="flex-1 rounded-xl px-5 py-2.5 text-sm font-semibold text-[#08080f] disabled:opacity-60" style={{ background: 'linear-gradient(120deg,#a78bfa,#22d3ee)' }}>
              {saving ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      )}

      {/* My Tickets */}
      <div>
        <h2 className="mb-4 font-display text-base font-semibold">
          My Tickets <span className="ml-1 font-mono text-xs text-white/40">({tickets.length})</span>
        </h2>

        {tickets.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <div className="mx-auto mb-3 text-4xl">📩</div>
            <p className="text-sm text-white/40">No tickets yet. Submit one if you need help or want to report an issue.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((t) => {
              const cat = getCat(t.category);
              const allScreenshots = getScreenshots(t);
              return (
                <div key={t.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-sm font-semibold">{t.subject}</h3>
                        <span className={'rounded-full border px-2 py-0.5 text-[10px] font-semibold ' + cat.color}>
                          {cat.icon} {cat.label}
                        </span>
                        <span className={'rounded-full border px-2 py-0.5 text-[10px] font-semibold ' + (STATUS_STYLES[t.status] || STATUS_STYLES.open)}>
                          {STATUS_LABELS[t.status] || t.status}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-white/50 whitespace-pre-wrap">{t.description}</p>
                      {allScreenshots.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {allScreenshots.map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                              <img src={url} alt="Screenshot" className="h-20 rounded-lg border border-white/10 object-cover" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="font-mono text-[11px] text-white/35">{fmtDate(t.created_at)}</div>
                  </div>

                  {t.admin_reply && (
                    <div className="mt-4 rounded-xl border border-cyan-400/20 bg-cyan-500/[0.05] p-4">
                      <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-cyan-400/60">Admin Reply</div>
                      <p className="text-sm text-white/70 whitespace-pre-wrap">{t.admin_reply}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
