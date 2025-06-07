export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR');
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString('pt-BR');
}

export function isToday(date: string | Date): boolean {
  const d = new Date(date);
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

export function isThisMonth(date: string | Date): boolean {
  const d = new Date(date);
  const today = new Date();
  return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
}

export function getLast7Days(): Date[] {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date);
  }
  return days;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}