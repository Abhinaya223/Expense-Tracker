import { useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useExpenses } from '../../contexts/ExpenseContext';
import { CATEGORIES, getCategoryById } from '../../utils/categories';
import { getMonthExpenses, formatCurrency } from '../../utils/helpers';
import './CategoryChart.css';

ChartJS.register(ArcElement, Tooltip);

// Plugin to draw total in center
const centerTextPlugin = {
  id: 'centerText',
  beforeDraw(chart) {
    const { ctx, width, height } = chart;
    const total = chart.config.options.plugins.centerText?.total;
    if (total === undefined) return;
    ctx.save();
    ctx.font = `700 1.1rem JetBrains Mono, monospace`;
    ctx.fillStyle = '#f0f0f0';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(formatCurrency(total), width / 2, height / 2 - 8);
    ctx.font = `500 0.65rem Inter, sans-serif`;
    ctx.fillStyle = '#8a8a99';
    ctx.fillText('TOTAL', width / 2, height / 2 + 14);
    ctx.restore();
  },
};

ChartJS.register(centerTextPlugin);

export default function CategoryChart() {
  const { expenses } = useExpenses();

  const monthExpenses = useMemo(() => getMonthExpenses(expenses), [expenses]);

  const { data: chartData, legend, total } = useMemo(() => {
    const catTotals = {};
    monthExpenses.forEach((e) => {
      catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
    });

    const entries = CATEGORIES
      .map((cat) => ({ ...cat, amount: catTotals[cat.id] || 0 }))
      .filter((c) => c.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    const total = entries.reduce((s, e) => s + e.amount, 0);

    return {
      data: {
        labels: entries.map((e) => e.label),
        datasets: [
          {
            data: entries.map((e) => e.amount),
            backgroundColor: entries.map((e) => e.color),
            borderColor: '#141418',
            borderWidth: 3,
            hoverBorderColor: '#1c1c22',
            hoverOffset: 6,
          },
        ],
      },
      legend: entries.map((e) => ({
        ...e,
        pct: total > 0 ? ((e.amount / total) * 100).toFixed(1) : '0',
      })),
      total,
    };
  }, [monthExpenses]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx) =>
            `${ctx.label}: ${formatCurrency(ctx.parsed)}`,
        },
        backgroundColor: '#1c1c22',
        titleColor: '#f0f0f0',
        bodyColor: '#f0f0f0',
        borderColor: '#2a2a35',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 10,
      },
      centerText: { total },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 800,
    },
  };

  return (
    <div className="category-chart card">
      <div className="card-header">
        <h2 className="card-title">Category Breakdown</h2>
      </div>

      {legend.length === 0 ? (
        <p className="text-muted" style={{ textAlign: 'center', padding: '20px 0' }}>
          No spending data this month
        </p>
      ) : (
        <div className="category-chart-body">
          <div className="category-chart-canvas">
            <Doughnut data={chartData} options={options} />
          </div>
          <div className="category-legend">
            {legend.map((item) => (
              <div key={item.id} className="category-legend-item">
                <span
                  className="category-legend-dot"
                  style={{ background: item.color }}
                />
                <span className="category-legend-icon">{item.icon}</span>
                <span className="category-legend-label">{item.label}</span>
                <span className="category-legend-amount mono-sm">
                  {formatCurrency(item.amount)}
                </span>
                <span className="category-legend-pct">{item.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
