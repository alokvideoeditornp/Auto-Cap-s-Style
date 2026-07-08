import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { projectName } = body;
    
    // Sanitize project name
    const safeProjectName = projectName ? projectName.replace(/[^a-z0-9 _-]/gi, '').trim() : '';
    const targetDir = safeProjectName 
      ? path.resolve(process.cwd(), 'public/renders', safeProjectName)
      : path.resolve(process.cwd(), 'public/renders');
      
    // Create directory if it doesn't exist
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Open the folder in file explorer
    if (process.platform === 'win32') {
      exec(`start "" "${targetDir}"`);
    } else if (process.platform === 'darwin') {
      exec(`open "${targetDir}"`);
    } else {
      exec(`xdg-open "${targetDir}"`);
    }

    return NextResponse.json({ success: true, path: targetDir });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
