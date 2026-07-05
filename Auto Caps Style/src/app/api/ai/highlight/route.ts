import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { lines } = await req.json(); // array of strings
    
    // For Phase 1, we will mock the AI response.
    // Given an array of lines, we return an array of objects: { highlight: ["word"] }
    
    const results = lines.map((line: string) => {
      const words = line.split(' ').filter((w: string) => w.trim().length > 0);
      if (words.length === 0) return { highlight: [] };
      
      // Mock logic: pick the longest word
      let longest = words[0];
      for (const w of words) {
        if (w.length > longest.length) {
          longest = w;
        }
      }
      
      // Remove punctuation for our basic mock
      return { highlight: [longest.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()] };
    });

    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process lines' }, { status: 500 });
  }
}
