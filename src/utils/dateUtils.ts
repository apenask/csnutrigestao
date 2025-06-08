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

// NOVA FUNÇÃO ADICIONADA
export function isThisWeek(date: string | Date): boolean {
  const d = new Date(date);
  const today = new Date();
  const firstDayOfWeek = today.getDate() - today.getDay();
  const lastDayOfWeek = firstDayOfWeek + 6;

  const startOfWeek = new Date(today.setDate(firstDayOfWeek));
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(today.setDate(lastDayOfWeek));
  endOfWeek.setHours(23, 59, 59, 999);

  return d >= startOfWeek && d <= endOfWeek;
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