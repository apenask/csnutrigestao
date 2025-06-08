import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { KPICard } from '../components/KPICard';
import { formatCurrency, formatDateTime, isToday, isThisWeek, isThisMonth, getLast7Days } from '../utils/dateUtils';

type TimePeriod = 'day' | 'week' | 'month';

export function Dashboard() {
  const { state } = useStore();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('day');

  const filteredSales = useMemo(() => {
    switch (timePeriod) {
      case 'week':
        return state.sales.filter(sale => isThisWeek(sale.date));
      case 'month':
        return state.sales.filter(sale => isThisMonth(sale.date));
      case 'day':
      default:
        return state.sales.filter(sale => isToday(sale.date));
    }
  }, [state.sales, timePeriod]);

  const revenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const cashBalance = state.cashFlow.reduce((balance, flow) => {
    return balance + (flow.type === 'expense' ? -flow.amount : flow.amount);
  }, 0);
  
  const last7Days = getLast7Days();
  const chartData = last7Days.map(date => {
    const dayString = date.toDateString();
    const daySales = state.sales.filter(sale => new Date(sale.date).toDateString() === dayString);
    const dayRevenue = daySales.reduce((sum, sale) => sum + sale.total, 0);
    return {
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      revenue: dayRevenue
    };
  });

  const recentActivities = [...state.sales, ...state.cashFlow]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const getPeriodLabel = () => {
    switch (timePeriod) {
      case 'week': return 'da Semana';
      case 'month': return 'do Mês';
      case 'day':
      default: return 'de Hoje';
    }
  };

  const getIconColorByValue = (value: number): 'green' | 'red' | 'neutral' => {
    if (value > 0) return 'green';
    if (value < 0) return 'red';
    return 'neutral';
  };
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Visão geral da CS Nutri</p>
        </div>
        <div className="flex rounded-lg p-1 card-secondary self-start">
          <button onClick={() => setTimePeriod('day')} className={`flex-1 text-sm py-2 px-4 rounded-md transition-all ${timePeriod === 'day' ? 'btn-red text-white' : 'hover:bg-opacity-50'}`}>Hoje</button>
          <button onClick={() => setTimePeriod('week')} className={`flex-1 text-sm py-2 px-4 rounded-md transition-all ${timePeriod === 'week' ? 'btn-red text-white' : 'hover:bg-opacity-50'}`}>Semana</button>
          <button onClick={() => setTimePeriod('month')} className={`flex-1 text-sm py-2 px-4 rounded-md transition-all ${timePeriod === 'month' ? 'btn-red text-white' : 'hover:bg-opacity-50'}`}>Mês</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title={`Faturamento ${getPeriodLabel()}`}
          value={formatCurrency(revenue)}
          icon={DollarSign}
          color={getIconColorByValue(revenue)}
        />
        <KPICard
          title={`Vendas ${getPeriodLabel()}`}
          value={filteredSales.length.toString()}
          icon={ShoppingBag}
          color={getIconColorByValue(filteredSales.length)}
        />
        <KPICard
          title="Saldo em Caixa"
          value={formatCurrency(cashBalance)}
          icon={DollarSign}
          color={getIconColorByValue(cashBalance)}
        />
        <KPICard
          title="Ticket Médio"
          value={formatCurrency(filteredSales.length > 0 ? revenue / filteredSales.length : 0)}
          icon={TrendingUp}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Faturamento - Últimos 7 Dias</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
                <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12}/>
                <YAxis stroke="var(--text-secondary)" fontSize={12} tickFormatter={(value) => `R$ ${value}`}/>
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Faturamento']} labelStyle={{ color: 'var(--text-primary)' }} contentStyle={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)', borderRadius: '8px' }}/>
                <Bar dataKey="revenue" fill="var(--accent-red)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Atividade Recente</h3>
          <div className="space-y-3">
            {recentActivities.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>Nenhuma atividade recente</p>
            ) : (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 card-secondary rounded-lg">
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{'items' in activity ? `Venda #${activity.id}` : activity.description}</p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{formatDateTime(activity.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${'items' in activity || activity.type === 'income' || activity.type === 'sale' ? 'text-green-600' : 'text-red-600'}`}>
                      {'items' in activity ? formatCurrency(activity.total) : activity.type === 'expense' ? `-${formatCurrency(activity.amount)}` : formatCurrency(activity.amount)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}