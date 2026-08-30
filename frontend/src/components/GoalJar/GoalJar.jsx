import { useState, useMemo } from 'react';
import { useGoal } from '../../contexts/GoalContext';
import { useExpenses } from '../../contexts/ExpenseContext';
import { getMonthExpenses, formatCurrency } from '../../utils/helpers';
import './GoalJar.css';

export default function GoalJar() {
  const { budget, setMonthlyBudget } = useGoal();
  const { expenses } = useExpenses();
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState('');

  const monthExpenses = useMemo(() => getMonthExpenses(expenses), [expenses]);
  const totalSpent = useMemo(
    () => monthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0),
    [monthExpenses]
  );

  const fillRatio = budget > 0 ? Math.min(totalSpent / budget, 1) : 0;
  const remainRatio = Math.max(1 - fillRatio, 0);
  const percentage = Math.round(fillRatio * 100);

  // Color based on fill level
  let fillColor = 'var(--teal)';
  let glowColor = 'var(--teal-glow)';
  if (fillRatio > 0.8) {
    fillColor = 'var(--primary)';
    glowColor = 'var(--primary-glow)';
  } else if (fillRatio > 0.5) {
    fillColor = 'var(--gold)';
    glowColor = 'var(--gold-glow)';
  }

  const handleSave = async () => {
    const val = Number(inputVal);
    if (val > 0) {
      await setMonthlyBudget(val);
    }
    setEditing(false);
    setInputVal('');
  };

  return (
    <div className="goal-jar card">
      <div className="card-header">
        <h2 className="card-title">Savings Goal</h2>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => {
            setEditing(!editing);
            setInputVal(budget > 0 ? String(budget) : '');
          }}
        >
          {editing ? 'Cancel' : budget > 0 ? 'Edit' : 'Set Budget'}
        </button>
      </div>

      {editing && (
        <div className="goal-jar-edit animate-fade-in">
          <div className="form-group">
            <label className="form-label" htmlFor="budget-input">Monthly Budget ($)</label>
            <div className="goal-jar-edit-row">
              <input
                id="budget-input"
                type="number"
                min="0"
                step="1"
                className="input input-mono"
                placeholder="e.g. 2000"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
              <button className="btn btn-teal btn-sm" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="goal-jar-visual">
        <svg
          viewBox="0 0 120 160"
          className="jar-svg"
          aria-label={`Budget jar: ${percentage}% spent`}
        >
          {/* Jar body */}
          <defs>
            <clipPath id="jarClip">
              <path d="M25 45 Q20 45 18 50 L15 130 Q15 145 30 145 L90 145 Q105 145 105 130 L102 50 Q100 45 95 45 Z" />
            </clipPath>
            <linearGradient id="liquidGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={fillColor} stopOpacity="0.9" />
              <stop offset="100%" stopColor={fillColor} stopOpacity="0.6" />
            </linearGradient>
          </defs>

          {/* Jar outline */}
          <path
            d="M25 45 Q20 45 18 50 L15 130 Q15 145 30 145 L90 145 Q105 145 105 130 L102 50 Q100 45 95 45 Z"
            fill="none"
            stroke="var(--border)"
            strokeWidth="2"
          />

          {/* Jar lid */}
          <rect x="22" y="35" width="76" height="12" rx="4" fill="var(--surface-hover)" stroke="var(--border)" strokeWidth="1.5" />
          <rect x="35" y="29" width="50" height="8" rx="3" fill="var(--surface)" stroke="var(--border)" strokeWidth="1" />

          {/* Liquid fill */}
          <g clipPath="url(#jarClip)">
            <rect
              x="15"
              y={45 + (100 * remainRatio)}
              width="90"
              height={100 * fillRatio}
              fill="url(#liquidGrad)"
              className="jar-liquid"
            />

            {/* Wave on top of liquid — only when there's enough fill to see it cleanly */}
            {fillRatio > 0.03 && (
              <path
                d={`M 15 ${45 + 100 * remainRatio} Q 35 ${41 + 100 * remainRatio}, 60 ${45 + 100 * remainRatio} Q 85 ${49 + 100 * remainRatio}, 105 ${45 + 100 * remainRatio} L 105 ${45 + 100} L 15 ${45 + 100} Z`}
                fill={fillColor}
                opacity="0.35"
                className="jar-wave"
              />
            )}

            {/* Bubbles — only show when fill is high enough that bubbles are inside liquid */}
            {fillRatio > 0.25 && (
              <>
                <circle cx="40" cy={45 + 100 * remainRatio + 20} r="3" fill="white" opacity="0.15" className="jar-bubble jar-bubble-1" />
                <circle cx="70" cy={45 + 100 * remainRatio + 35} r="2" fill="white" opacity="0.12" className="jar-bubble jar-bubble-2" />
                <circle cx="55" cy={45 + 100 * remainRatio + 50} r="2.5" fill="white" opacity="0.1" className="jar-bubble jar-bubble-3" />
              </>
            )}
          </g>

          {/* Percentage text */}
          <text
            x="60"
            y={budget > 0 ? 95 : 100}
            textAnchor="middle"
            className="jar-percentage"
            fill="var(--text)"
            fontSize="18"
            fontFamily="var(--font-display)"
          >
            {budget > 0 ? `${percentage}%` : '--'}
          </text>
          <text
            x="60"
            y="112"
            textAnchor="middle"
            fill="var(--text-muted)"
            fontSize="7"
            fontFamily="var(--font-body)"
          >
            {budget > 0 ? 'BUDGET USED' : 'NO BUDGET'}
          </text>
        </svg>

        {/* Stats below jar */}
        {budget > 0 && (
          <div className="goal-jar-stats">
            <div className="goal-jar-stat">
              <span className="text-muted">Budget</span>
              <span className="mono-sm">{formatCurrency(budget)}</span>
            </div>
            <div className="goal-jar-stat">
              <span className="text-muted">Spent</span>
              <span className="mono-sm" style={{ color: fillColor }}>
                {formatCurrency(totalSpent)}
              </span>
            </div>
            <div className="goal-jar-stat">
              <span className="text-muted">Left</span>
              <span className="mono-sm" style={{ color: budget - totalSpent >= 0 ? 'var(--teal)' : 'var(--primary)' }}>
                {formatCurrency(Math.abs(budget - totalSpent))}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
