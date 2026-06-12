export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function moveItem<T>(arr: T[], from: number, to: number): T[] {
  const result = [...arr];
  const [item] = result.splice(from, 1);
  result.splice(to, 0, item);
  return result;
}

export function reorder<T extends { order: number }>(items: T[]): T[] {
  return items.map((item, i) => ({ ...item, order: i }));
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}
