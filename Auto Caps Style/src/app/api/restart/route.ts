import { NextResponse } from 'next/server';
import { exec } from 'child_process';

export async function POST() {
  try {
    setTimeout(() => {
      if (process.platform === 'win32') {
        exec('taskkill /F /IM node.exe', () => {
          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    }, 500);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
