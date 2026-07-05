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
        
        // Auto-detect important word
        const words = text.split(' ').filter(w => w.trim().length > 0);
        let cleanImportant = '';
        let bestIndex = -1;

        if (words.length > 0) {
          let bestWord = words[0];
          let maxScore = -100;

          words.forEach((w, index) => {
            let score = w.length; 
            if (index === words.length - 1) score += 3; // Punchline bonus
            if (index === 0) score += 1; // Start word bonus
            if (w.match(/[A-Z]/)) {
              if (w === w.toUpperCase()) {
                score += 5; // All caps bonus
              } else {
                score += 2; // Title case bonus
              }
            }
            if (w.length <= 2) score -= 10; // Penalize stop words strongly
            if (w.length >= 7) score += 2; // Reward long descriptive words

            if (score > maxScore) {
              maxScore = score;
              bestWord = w;
            }
          });
          
          cleanImportant = bestWord.replace(/[.,!?;:"'(){}[\\]\\-]/g, '').toLowerCase().trim();
          words.forEach((w, i) => {
            if (w === bestWord && bestIndex === -1) {
              bestIndex = i;
            }
          });
        }

        segments.push({
          id,
          startTime: parseTimeToMs(timeMatch[1]),
          endTime: parseTimeToMs(timeMatch[2]),
          text,
          highlightedWords: cleanImportant ? [cleanImportant] : [],
          highlightedIndices: bestIndex !== -1 ? [bestIndex] : [],
          originalHighlightedWords: cleanImportant ? [cleanImportant] : [],
          originalHighlightedIndices: bestIndex !== -1 ? [bestIndex] : []
        });
      }
    }
  }
  if (segments.length > 0 && segments[0].startTime < 333) {
    segments[0].startTime = 333;
    if (segments[0].endTime <= 333) {
      segments[0].endTime = 333 + 1000;
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
