import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

export async function GET() {
  try {
    const fontFamilies = new Map<string, { label: string, value: number, fullName: string }[]>();

    const queries = [
      'reg query "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts"',
      'reg query "HKCU\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts"'
    ];

    for (const query of queries) {
      try {
        const { stdout } = await execAsync(query);
        const lines = stdout.split('\n');
        
        for (const line of lines) {
          if (line.includes('REG_SZ')) {
            const parts = line.trim().split('    ');
            if (parts.length > 0) {
              let fontName = parts[0];
              fontName = fontName.replace(/\(TrueType\)/gi, '').replace(/\(OpenType\)/gi, '').trim();
              if (fontName) {
                const weightMatch = fontName.match(/\b(Thin|Hairline|ExtraLight|Extra Light|UltraLight|Ultra Light|Light|Regular|Normal|Medium|SemiBold|Semi Bold|DemiBold|Demi Bold|Bold|ExtraBold|Extra Bold|UltraBold|Ultra Bold|Black|Heavy)\b/i);
                
                let family = fontName;
                let weightLabel = 'Regular';
                let weightValue = 400;
                
                if (weightMatch) {
                  const w = weightMatch[1].toLowerCase().replace(' ', '');
                  family = fontName.replace(weightMatch[0], '').trim();
                  if (w === 'thin' || w === 'hairline') { weightLabel = 'Thin'; weightValue = 100; }
                  else if (w === 'extralight' || w === 'ultralight') { weightLabel = 'Extra Light'; weightValue = 200; }
                  else if (w === 'light') { weightLabel = 'Light'; weightValue = 300; }
                  else if (w === 'regular' || w === 'normal') { weightLabel = 'Regular'; weightValue = 400; }
                  else if (w === 'medium') { weightLabel = 'Medium'; weightValue = 500; }
                  else if (w === 'semibold' || w === 'demibold') { weightLabel = 'Semi Bold'; weightValue = 600; }
                  else if (w === 'bold') { weightLabel = 'Bold'; weightValue = 700; }
                  else if (w === 'extrabold' || w === 'ultrabold') { weightLabel = 'Extra Bold'; weightValue = 800; }
                  else if (w === 'black' || w === 'heavy') { weightLabel = 'Black'; weightValue = 900; }
                }
                
                family = family.replace(/\bItalic\b/ig, '').trim();
                if (!family) family = fontName;

                if (!fontFamilies.has(family)) {
                  fontFamilies.set(family, []);
                }
                
                const weights = fontFamilies.get(family)!;
                if (!weights.find(w => w.value === weightValue)) {
                   weights.push({ label: weightLabel, value: weightValue, fullName: fontName });
                }
              }
            }
          }
        }
      } catch (err) {
        console.warn('Failed to query registry key:', query, err);
      }
    }
    
    const result = Array.from(fontFamilies.entries()).map(([family, weights]) => {
       weights.sort((a, b) => a.value - b.value);
       return { family, weights };
    }).sort((a, b) => a.family.localeCompare(b.family));

    return NextResponse.json({ fontsGrouped: result });
  } catch (error) {
    console.error('Error fetching fonts:', error);
    return NextResponse.json({ fontsGrouped: [] }, { status: 500 });
  }
}
