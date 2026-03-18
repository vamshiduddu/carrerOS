import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatRelativeDate(date: string | Date) {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return formatDate(date);
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    saved: 'badge-muted',
    applied: 'badge-blue',
    screening: 'badge-amber',
    interview: 'badge-amber',
    offer: 'badge-green',
    rejected: 'badge-red',
    withdrawn: 'badge-muted',
    active: 'badge-green',
    completed: 'badge-green',
    inactive: 'badge-muted',
    pending: 'badge-amber'
  };
  return map[status?.toLowerCase()] ?? 'badge-muted';
}

export function statusLabel(status: string): string {
  return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
}

export function truncate(str: string, max = 80): string {
  return str.length > max ? str.slice(0, max) + '...' : str;
}
