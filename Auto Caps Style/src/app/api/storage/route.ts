import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function getFolderSize(dirPath: string): number {
  let totalSize = 0;
  
  if (!fs.existsSync(dirPath)) return 0;

  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      totalSize += getFolderSize(fullPath);
    } else {
      totalSize += stats.size;
    }
  }

  return totalSize;
}

export async function GET() {
  try {
    const rendersDir = path.resolve(process.cwd(), 'public/renders');
    
    // Check if the directory exists
    if (!fs.existsSync(rendersDir)) {
      return NextResponse.json({ sizeBytes: 0, sizeGB: 0 });
    }

    const sizeBytes = getFolderSize(rendersDir);
    const sizeGB = sizeBytes / (1024 * 1024 * 1024);

    return NextResponse.json({ sizeBytes, sizeGB });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
