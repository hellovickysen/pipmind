"use client";

import ShareButton from '@/components/share/ShareButton';

export default function DashboardShareButton({ data }) {
  return <ShareButton type="daily" data={data} />;
}
