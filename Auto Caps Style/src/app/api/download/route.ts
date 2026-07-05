import { NextResponse } from 'next/server';
import fs from 'fs';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const filePath = searchParams.get('path');
  
  if (!filePath || !fs.existsSync(filePath)) {
    return new NextResponse('File not found', { status: 404 });
  }

  const stat = fs.statSync(filePath);
  
  const stream = fs.createReadStream(filePath);

  return new NextResponse(stream as unknown as ReadableStream, {
    headers: {
      'Content-Type': 'video/mp4',
      'Content-Length': stat.size.toString(),
      'Content-Disposition': 'attachment; filename="captionflow-render.mp4"',
    },
  });
}
