"use client";

import { useEffect } from 'react';
import { captureReferral } from '@/app/dashboard/referrals/actions';

/**
 * Invisible component that checks for a referral cookie on mount.
 * If found, captures the referral and clears the cookie.
 * Render this once in the dashboard.
 */
export default function ReferralCapture() {
  useEffect(() => {
    const cookies = document.cookie.split(';').map((c) => c.trim());
    const refCookie = cookies.find((c) => c.startsWith('ref_code='));
    if (!refCookie) return;

    const refCode = refCookie.split('=')[1];
    if (!refCode) return;

    // Clear the cookie immediately
    document.cookie = 'ref_code=; path=/; max-age=0';

    // Process the referral
    captureReferral(refCode).catch(() => {});
  }, []);

  return null;
}
