import { useMemo, useEffect, useState, useRef } from 'react';
import { useExpenses } from '../../contexts/ExpenseContext';
import { useGoal } from '../../contexts/GoalContext';
import { getMonthExpenses, getCurrentMonthYear, formatCurrency } from '../../utils/helpers';
import './HeroStats.css';

function AnimatedNumber({ value, prefix = '', isCurrency = false }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const prevValue = useRef(0);

  useEffect(() => {
    const start = prevValue.current;
    const end = value;
    const duration = 800;
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;
      setDisplay(current);
      if (progress < 1) {
        ref.current = requestAnimationFrame(tick);
      } else {
        prevValue.current = end;
      }
    }

    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [value]);

  const formatted = isCurrency
    ? formatCurrency(display)
    : Math.round(display).toLocaleString();

  return <span className="mono-lg">{prefix}{formatted}</span>;
}

export default function HeroStats() {
  const { expenses } = useExpenses();
  const { budget } = useGoal();
  const { label } = getCurrentMonthYear();

  const monthExpenses = useMemo(() => getMonthExpenses(expenses), [expenses]);
  const totalSpent = useMemo(
    () => monthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0),
    [monthExpenses]
  );
  const remaining = budget > 0 ? budget - totalSpent : 0;

  return (
    <section className="hero-stats" aria-label="Monthly overview">
      <div className="hero-stat-card">
        <span className="hero-stat-label">{label}</span>
        <AnimatedNumber value={totalSpent} isCurrency />
        <span className="hero-stat-sub">spent this month</span>
      </div>

      <div className={`hero-stat-card ${remaining >= 0 ? 'stat-teal' : 'stat-danger'}`}>
        <span className="hero-stat-label">Budget Remaining</span>
        <AnimatedNumber value={Math.abs(remaining)} isCurrency />
        <span className="hero-stat-sub">
          {budget > 0
            ? remaining >= 0 ? 'left to spend' : 'over budget!'
            : 'no budget set'}
        </span>
      </div>

      <div className="hero-stat-card stat-neutral">
        <span className="hero-stat-label">Transactions</span>
        <AnimatedNumber value={monthExpenses.length} />
        <span className="hero-stat-sub">this month</span>
      </div>
    </section>
  );
}
