import { CaptionSegment } from '@/store/useProjectStore';
// Removed srt-parser-2 dependency

export const parseSrt = (srtContent: string): CaptionSegment[] => {
  // Normalize line endings and split by double blank lines
  const normalized = srtContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = normalized.split(/\n\n+/);
  
  const segments: CaptionSegment[] = [];
  
  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length >= 3) {
      const id = lines[0].trim();
      const timeLine = lines[1];
      const textLines = lines.slice(2);
      
      const timeMatch = timeLine.match(/(\d{1,2}:\d{2}:\d{2}[,.]\d{2,3})\s*-->\s*(\d{1,2}:\d{2}:\d{2}[,.]\d{2,3})/);
      
      if (timeMatch) {
        const text = textLines.join(' ').replace(/<[^>]+>/g, '').trim();
        
        // Auto-detect important word (longest word or fully uppercase word)
        const words = text.split(' ');
        let importantWord = '';
        
        // Find uppercase words first (excluding I)
        const upperWords = words.filter(w => w === w.toUpperCase() && w.length > 1 && w.match(/[A-Z]/));
        if (upperWords.length > 0) {
          importantWord = upperWords[0];
        } else {
          // Fallback to longest word
          importantWord = words.reduce((longest, current) => current.length > longest.length ? current : longest, '');
        }
        
        const cleanImportant = importantWord.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

        segments.push({
          id,
          startTime: parseTimeToMs(timeMatch[1]),
          endTime: parseTimeToMs(timeMatch[2]),
          text,
          highlightedWords: cleanImportant ? [cleanImportant] : [],
        });
      }
    }
  }
  
  return segments;
};

// Converts "HH:MM:SS,ms" or "HH:MM:SS.ms" to milliseconds
const parseTimeToMs = (timeString: string): number => {
  if (!timeString) return 0;
  const parts = timeString.split(':');
  if (parts.length !== 3) return 0;
  const [hours, minutes, secondsAndMs] = parts;
  const [seconds, ms] = secondsAndMs.split(/[,.]/);
  
  const h = parseInt(hours, 10) || 0;
  const m = parseInt(minutes, 10) || 0;
  const s = parseInt(seconds, 10) || 0;
  const mil = parseInt(ms, 10) || 0;

  return h * 3600000 + m * 60000 + s * 1000 + mil;
};
