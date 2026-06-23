"use client";

import { useEffect } from 'react';
import { captureReferral } from '@/app/dashboard/referrals/actions';

/**
 * Invisible component that checks for a referral code on mount.
 * Checks both localStorage and cookie (localStorage survives OAuth redirects).
 * If found, captures the referral and clears both storage locations.
 */
export default function ReferralCapture() {
  useEffect(() => {
    let refCode = null;

    // Check localStorage first (most reliable through OAuth)
    try {
      refCode = localStorage.getItem('ref_code');
    } catch (e) {}

    // Fallback: check cookie
    if (!refCode) {
      try {
        const cookies = document.cookie.split(';').map((c) => c.trim());
        const refCookie = cookies.find((c) => c.startsWith('ref_code='));
        if (refCookie) refCode = refCookie.split('=')[1];
      } catch (e) {}
    }

    if (!refCode) return;

    // Clear both storage locations immediately
    try { localStorage.removeItem('ref_code'); } catch (e) {}
    document.cookie = 'ref_code=; path=/; max-age=0';

    // Process the referral
    captureReferral(refCode)
      .then((res) => {
        if (res && res.error) console.warn('[Referral]', res.error);
      })
      .catch((err) => console.warn('[Referral] capture failed:', err));
  }, []);

  return null;
}
