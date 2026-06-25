import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 128,
          height: 128,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 28,
          background: 'linear-gradient(135deg, #a78bfa, #22d3ee)',
        }}
      >
        <svg width="128" height="128" viewBox="0 0 100 100">
          <polygon points="22,42 50,49 50,75 22,69" fill="#08080f" />
          <polygon points="78,42 50,49 50,75 78,69" fill="#08080f" />
          <polyline
            points="50,49 63,39 74,27"
            fill="none"
            stroke="#08080f"
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="74" cy="27" r="4.5" fill="#08080f" />
        </svg>
      </div>
    ),
    {
      width: 128,
      height: 128,
    }
  );
}
