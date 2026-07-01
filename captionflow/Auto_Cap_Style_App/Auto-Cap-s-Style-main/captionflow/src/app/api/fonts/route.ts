import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

export async function GET() {
  try {
    // Windows registry path for fonts
    const { stdout } = await execAsync('reg query "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts"');
    
    const fonts = new Set<string>();
    const lines = stdout.split('\n');
    
    for (const line of lines) {
      if (line.includes('REG_SZ')) {
        const parts = line.trim().split('    ');
        if (parts.length > 0) {
          let fontName = parts[0];
          fontName = fontName.replace(/\(TrueType\)/gi, '').replace(/\(OpenType\)/gi, '').trim();
          if (fontName) {
            fonts.add(fontName);
          }
        }
      }
    }
    
    return NextResponse.json({ fonts: Array.from(fonts).sort() });
  } catch (error) {
    console.error('Error fetching fonts:', error);
    return NextResponse.json({ fonts: [] }, { status: 500 });
  }
}
