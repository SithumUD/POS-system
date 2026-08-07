export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const minutes = Math.round(diff / 60000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.round(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;

  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return `${date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })} · ${date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  })}`;
}

export function formatShortDateTime(iso: string): string {
  const date = new Date(iso);
  return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${date.toLocaleTimeString(
    'en-US',
    { hour: 'numeric', minute: '2-digit' }
  )}`;
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });
}

/** ISO string → "yyyy-mm-dd" for <input type="date"> values. */
export function toDateInput(iso: string): string {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** "yyyy-mm-dd" → ISO string at 9 AM local time. */
export function fromDateInput(value: string, hour = 9): string {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date();
  date.setFullYear(year, (month ?? 1) - 1, day ?? 1);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

/** Whole days from now until the given date. Negative when overdue. */
export function daysUntil(iso: string): number {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(iso);
  end.setHours(0, 0, 0, 0);
  return Math.round((end.getTime() - start.getTime()) / 86400000);
}

export function daysAgo(days: number, hour = 12, minute = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

export function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60000).toISOString();
}