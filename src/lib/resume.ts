import type { Resume } from '@/types/resume';
import resumeData from '@/data/resume.json';

let resumeCache: Resume | null = null;

export async function getResume(): Promise<Resume> {
  if (resumeCache) return resumeCache;
  resumeCache = resumeData as Resume;
  return resumeCache;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}

export function formatDateRange(start: string, end: string): string {
  const startFormatted = formatDate(start);
  const endFormatted = end ? formatDate(end) : 'Present';
  return `${startFormatted} — ${endFormatted}`;
}
