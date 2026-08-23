import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STATE_FILE = path.join(DATA_DIR, 'user_state.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export async function GET() {
  try {
    ensureDataDir();
    if (!fs.existsSync(STATE_FILE)) {
      return NextResponse.json({ exists: false, data: null });
    }
    const raw = fs.readFileSync(STATE_FILE, 'utf-8');
    if (!raw || !raw.trim()) {
      return NextResponse.json({ exists: false, data: null });
    }
    const data = JSON.parse(raw);
    return NextResponse.json({ exists: true, data });
  } catch (error) {
    console.error('Failed to read user state:', error);
    return NextResponse.json({ exists: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    ensureDataDir();
    const body = await req.json();
    if (!body) {
      return NextResponse.json({ error: 'Missing body' }, { status: 400 });
    }
    
    fs.writeFileSync(STATE_FILE, JSON.stringify(body, null, 2), 'utf-8');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save user state:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    ensureDataDir();
    if (fs.existsSync(STATE_FILE)) {
      fs.unlinkSync(STATE_FILE);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete user state:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
