import { NextResponse } from 'next/server';

export async function POST() {
  try {
    setTimeout(() => {
      process.exit(0);
    }, 600);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
