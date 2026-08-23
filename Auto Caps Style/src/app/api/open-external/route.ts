import { NextResponse } from 'next/server';
import { exec } from 'child_process';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 });
    }

    const cleanUrl = url.trim();
    const cmd = process.platform === 'win32'
      ? `start "" "${cleanUrl}"`
      : process.platform === 'darwin'
        ? `open "${cleanUrl}"`
        : `xdg-open "${cleanUrl}"`;

    exec(cmd, (err) => {
      if (err) console.error('Failed to open external link:', err);
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
