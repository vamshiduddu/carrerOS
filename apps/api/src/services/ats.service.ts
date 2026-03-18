const STOPWORDS = new Set([
  'about', 'above', 'after', 'also', 'been', 'before', 'being', 'between', 'both',
  'come', 'could', 'does', 'done', 'each', 'from', 'have', 'here', 'into', 'just',
  'know', 'like', 'make', 'more', 'most', 'much', 'need', 'only', 'other', 'over',
  'same', 'such', 'than', 'that', 'their', 'them', 'then', 'there', 'these', 'they',
  'this', 'time', 'very', 'want', 'well', 'were', 'what', 'when', 'where', 'which',
  'will', 'with', 'would', 'your'
]);

export function extractKeywords(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 4 && !STOPWORDS.has(word));

  const seen = new Set<string>();
  const unique: string[] = [];
  for (const word of words) {
    if (!seen.has(word)) {
      seen.add(word);
      unique.push(word);
    }
    if (unique.length >= 40) break;
  }

  return unique;
}

export function scoreResume(
  resumeText: string,
  jobDescription: string
): { score: number; found: string[]; missing: string[] } {
  const jobKeywords = extractKeywords(jobDescription);
  const resumeKeywords = new Set(extractKeywords(resumeText));

  const found: string[] = [];
  const missing: string[] = [];

  for (const keyword of jobKeywords) {
    if (resumeKeywords.has(keyword)) {
      found.push(keyword);
    } else {
      missing.push(keyword);
    }
  }

  const total = jobKeywords.length;
  const score = total === 0 ? 0 : Math.round((found.length / total) * 100);

  return { score, found, missing };
}
