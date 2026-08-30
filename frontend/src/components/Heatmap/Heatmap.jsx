import { useMemo, useState } from 'react';
import { useExpenses } from '../../contexts/ExpenseContext';
import { formatCurrency } from '../../utils/helpers';
import './Heatmap.css';

function getDaysGrid() {
  const days = [];
  const today = new Date();
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push({
      date: d.toISOString().split('T')[0],
      dayOfWeek: d.getDay(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      dayNum: d.getDate(),
    });
  }
  return days;
}

function getWeeks(days) {
  const weeks = [];
  let currentWeek = [];
  days.forEach((day) => {
    if (day.dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  });
  if (currentWeek.length > 0) weeks.push(currentWeek);
  return weeks;
}

function getIntensity(amount, max) {
  if (!amount || max === 0) return 0;
  const ratio = amount / max;
  if (ratio < 0.15) return 1;
  if (ratio < 0.35) return 2;
  if (ratio < 0.6) return 3;
  return 4;
}

const DAY_LABELS = ['', 'M', '', 'W', '', 'F', ''];

export default function Heatmap() {
  const { expenses } = useExpenses();
  const [tooltip, setTooltip] = useState(null);

  const { days, weeks, maxAmount, spendByDay, heatmapStats } = useMemo(() => {
    const days = getDaysGrid();
    const weeks = getWeeks(days);

    const spendByDay = {};
    const dateSet = new Set(days.map((d) => d.date));

    expenses.forEach((e) => {
      if (dateSet.has(e.date)) {
        spendByDay[e.date] = (spendByDay[e.date] || 0) + e.amount;
      }
    });

    const amounts = Object.values(spendByDay).filter(Boolean);
    const maxAmount = amounts.length > 0 ? Math.max(...amounts) : 0;
    const totalSpend = amounts.reduce((s, a) => s + a, 0);
    const activeDays = amounts.length;

    // Most expensive day
    let peakDate = null;
    let peakAmount = 0;
    Object.entries(spendByDay).forEach(([date, amt]) => {
      if (amt > peakAmount) { peakAmount = amt; peakDate = date; }
    });

    // Avg daily spend (only days with spend)
    const avgDaily = activeDays > 0 ? totalSpend / activeDays : 0;

    return {
      days,
      weeks,
      maxAmount,
      spendByDay,
      heatmapStats: { totalSpend, activeDays, peakDate, peakAmount, avgDaily },
    };
  }, [expenses]);

  const monthLabels = useMemo(() => {
    const labels = [];
    let lastMonth = '';
    weeks.forEach((week, wi) => {
      const firstDay = week[0];
      if (firstDay && firstDay.month !== lastMonth) {
        labels.push({ month: firstDay.month, col: wi });
        lastMonth = firstDay.month;
      }
    });
    return labels;
  }, [weeks]);

  return (
    <div className="heatmap card">
      <div className="card-header">
        <h2 className="card-title">Spending Heatmap</h2>
        <span className="text-muted" style={{ fontSize: '0.8rem' }}>Last 12 weeks</span>
      </div>

      {/* Side-by-side: grid on left, stat block on right */}
      <div className="heatmap-layout">

        {/* Grid section */}
        <div className="heatmap-scroll">
          <div className="heatmap-container">
            {/* Month labels */}
            <div className="heatmap-months">
              <div className="heatmap-day-label-spacer" />
              {weeks.map((_, wi) => {
                const label = monthLabels.find((l) => l.col === wi);
                return (
                  <div key={wi} className="heatmap-month-cell">
                    {label ? label.month : ''}
                  </div>
                );
              })}
            </div>

            <div className="heatmap-body">
              {/* Day labels */}
              <div className="heatmap-day-labels">
                {DAY_LABELS.map((label, i) => (
                  <div key={i} className="heatmap-day-label">{label}</div>
                ))}
              </div>

              {/* Grid */}
              <div className="heatmap-grid">
                {weeks.map((week, wi) => (
                  <div key={wi} className="heatmap-week">
                    {wi === 0 &&
                      Array.from({ length: week[0].dayOfWeek }).map((_, pi) => (
                        <div key={`pad-${pi}`} className="heatmap-cell heatmap-cell-empty" />
                      ))}
                    {week.map((day) => {
                      const amount = spendByDay[day.date] || 0;
                      const intensity = getIntensity(amount, maxAmount);
                      return (
                        <div
                          key={day.date}
                          className={`heatmap-cell heatmap-level-${intensity}`}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setTooltip({
                              date: day.date,
                              amount,
                              x: rect.left + rect.width / 2,
                              y: rect.top,
                            });
                          }}
                          onMouseLeave={() => setTooltip(null)}
                          aria-label={`${day.date}: ${formatCurrency(amount)}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="heatmap-legend">
              <span className="text-muted" style={{ fontSize: '0.7rem' }}>Less</span>
              {[0, 1, 2, 3, 4].map((l) => (
                <div key={l} className={`heatmap-cell heatmap-level-${l}`} style={{ width: 12, height: 12 }} />
              ))}
              <span className="text-muted" style={{ fontSize: '0.7rem' }}>More</span>
            </div>
          </div>
        </div>

        {/* Stat sidebar — fills the empty panel space */}
        <div className="heatmap-stats-sidebar">
          <div className="heatmap-stat-item">
            <span className="heatmap-stat-label">12-Week Total</span>
            <span className="heatmap-stat-value mono-sm">
              {heatmapStats.totalSpend > 0 ? formatCurrency(heatmapStats.totalSpend) : '—'}
            </span>
          </div>
          <div className="heatmap-stat-divider" />
          <div className="heatmap-stat-item">
            <span className="heatmap-stat-label">Active Days</span>
            <span className="heatmap-stat-value mono-sm">
              {heatmapStats.activeDays > 0 ? heatmapStats.activeDays : '—'}
            </span>
          </div>
          <div className="heatmap-stat-divider" />
          <div className="heatmap-stat-item">
            <span className="heatmap-stat-label">Peak Day</span>
            <span className="heatmap-stat-value mono-sm" style={{ fontSize: '0.8rem' }}>
              {heatmapStats.peakDate
                ? new Date(heatmapStats.peakDate + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                : '—'}
            </span>
            {heatmapStats.peakAmount > 0 && (
              <span className="heatmap-stat-sub">{formatCurrency(heatmapStats.peakAmount)}</span>
            )}
          </div>
          <div className="heatmap-stat-divider" />
          <div className="heatmap-stat-item">
            <span className="heatmap-stat-label">Avg / Active Day</span>
            <span className="heatmap-stat-value mono-sm">
              {heatmapStats.avgDaily > 0 ? formatCurrency(heatmapStats.avgDaily) : '—'}
            </span>
          </div>
        </div>

      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="heatmap-tooltip"
          style={{ left: tooltip.x, top: tooltip.y - 8 }}
        >
          <strong>{tooltip.date}</strong>
          <span className="mono-sm">{formatCurrency(tooltip.amount)}</span>
        </div>
      )}
    </div>
  );
}
