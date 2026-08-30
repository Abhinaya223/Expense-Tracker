export const CATEGORIES = [
  { id: 'food', label: 'Food', icon: '🍕', color: '#e0293f' },
  { id: 'transport', label: 'Transport', icon: '🚗', color: '#3b82f6' },
  { id: 'shopping', label: 'Shopping', icon: '🛒', color: '#a855f7' },
  { id: 'bills', label: 'Bills', icon: '💡', color: '#f5c453' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬', color: '#ec4899' },
  { id: 'health', label: 'Health', icon: '💊', color: '#2dd4a7' },
  { id: 'other', label: 'Other', icon: '📦', color: '#8a8a99' },
];

export function getCategoryById(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
}

export function getCategoryColor(id) {
  return getCategoryById(id).color;
}

export function getCategoryIcon(id) {
  return getCategoryById(id).icon;
}
