import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const COLORS_FILE = path.join(DATA_DIR, 'custom_colors.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export async function GET() {
  try {
    ensureDataDir();
    if (!fs.existsSync(COLORS_FILE)) {
      return NextResponse.json({ success: true, colors: [] });
    }
    const raw = fs.readFileSync(COLORS_FILE, 'utf-8');
    if (!raw || !raw.trim()) {
      return NextResponse.json({ success: true, colors: [] });
    }
    const data = JSON.parse(raw);
    const colors = Array.isArray(data) ? data : (Array.isArray(data?.colors) ? data.colors : []);
    return NextResponse.json({ success: true, colors });
  } catch (error) {
    console.error('Failed to read custom colors:', error);
    return NextResponse.json({ success: false, colors: [] }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    ensureDataDir();
    const body = await req.json();
    const colors = Array.isArray(body) ? body : (Array.isArray(body?.colors) ? body.colors : []);
    fs.writeFileSync(COLORS_FILE, JSON.stringify(colors, null, 2), 'utf-8');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save custom colors:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
