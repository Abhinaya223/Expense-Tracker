import { useState, useCallback } from 'react';
import { useExpenses } from '../../contexts/ExpenseContext';
import { getCategoryById } from '../../utils/categories';
import { formatCurrency } from '../../utils/helpers';
import './ExpenseFeed.css';

export default function ExpenseFeed() {
  const { expenses, deleteExpense } = useExpenses();
  const [deletingId, setDeletingId] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const displayed = showAll ? expenses : expenses.slice(0, 20);

  const handleDelete = useCallback(
    async (id) => {
      setDeletingId(id);
      setTimeout(async () => {
        try {
          await deleteExpense(id);
        } catch (e) {
          console.error('Delete failed:', e);
        }
        setDeletingId(null);
      }, 300);
    },
    [deleteExpense]
  );

  return (
    <div className="expense-feed card">
      <div className="card-header">
        <h2 className="card-title">Recent Expenses</h2>
        <span className="text-muted" style={{ fontSize: '0.8rem' }}>
          {expenses.length} total
        </span>
      </div>

      {expenses.length === 0 ? (
        <div className="expense-feed-empty">
          <div className="expense-empty-badge">⚡ READY TO TRACK</div>
          <p className="expense-empty-title">No Expenses Logged Yet</p>
          <p className="text-muted expense-empty-sub">
            Add your first expense above to unlock category charts, heatmaps & AI insights.
          </p>

          <div className="quick-guide-grid">
            <div className="quick-guide-card">
              <span className="quick-guide-icon">🎯</span>
              <div className="quick-guide-text">
                <strong>Set Budget</strong>
                <span>Define monthly budget in Savings Goal</span>
              </div>
            </div>
            <div className="quick-guide-card">
              <span className="quick-guide-icon">💸</span>
              <div className="quick-guide-text">
                <strong>Log Expenses</strong>
                <span>Add transactions above in seconds</span>
              </div>
            </div>
            <div className="quick-guide-card">
              <span className="quick-guide-icon">🤖</span>
              <div className="quick-guide-text">
                <strong>AI Assistant</strong>
                <span>Get smart savings tips in real-time</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="expense-feed-list">
            {displayed.map((expense, i) => {
              const cat = getCategoryById(expense.category);
              return (
                <div
                  key={expense.id}
                  className={`expense-row ${
                    deletingId === expense.id ? 'expense-row-deleting' : ''
                  }`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="expense-row-left">
                    <span
                      className="expense-cat-dot"
                      style={{ background: cat.color }}
                    >
                      {cat.icon}
                    </span>
                    <div className="expense-info">
                      <span className="expense-note">
                        {expense.note || cat.label}
                      </span>
                      <span className="expense-date">{expense.date}</span>
                    </div>
                  </div>
                  <div className="expense-row-right">
                    <span className="expense-amount mono-sm">
                      {formatCurrency(expense.amount)}
                    </span>
                    <button
                      className="btn-icon expense-delete"
                      onClick={() => handleDelete(expense.id)}
                      aria-label={`Delete expense: ${expense.note || cat.label}`}
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {expenses.length > 20 && (
            <button
              className="btn btn-ghost btn-sm expense-show-all"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show Less' : `Show All (${expenses.length})`}
            </button>
          )}
        </>
      )}
    </div>
  );
}
