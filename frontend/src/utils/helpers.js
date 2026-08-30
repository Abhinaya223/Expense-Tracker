export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function getCurrentMonthYear() {
  const now = new Date();
  return {
    month: now.getMonth(),
    year: now.getFullYear(),
    label: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
  };
}

export function isCurrentMonth(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}

export function getMonthExpenses(expenses) {
  return expenses.filter((e) => isCurrentMonth(e.date));
}

export function getTodayDateString() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}
