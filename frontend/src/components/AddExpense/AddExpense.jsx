import { useState } from 'react';
import { useExpenses } from '../../contexts/ExpenseContext';
import { CATEGORIES } from '../../utils/categories';
import { getTodayDateString } from '../../utils/helpers';
import './AddExpense.css';

export default function AddExpense() {
  const { addExpense } = useExpenses();
  const [open, setOpen] = useState(true);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError('Enter a valid amount');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await addExpense({ amount, category, note, date });
      setAmount('');
      setNote('');
      setDate(getTodayDateString());
      setSuccess(true);
      setTimeout(() => setSuccess(false), 1500);
    } catch (err) {
      setError('Failed to add expense. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="add-expense card">
      <button
        className="add-expense-toggle"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="add-expense-toggle-icon">{open ? '−' : '+'}</span>
        <span className="card-title">Add New Expense</span>
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="add-expense-form animate-fade-in-up">
          <div className="add-expense-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="expense-amount">Amount (₹)</label>
              <input
                id="expense-amount"
                type="number"
                step="0.01"
                min="0"
                className="input input-mono"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="expense-category">Category</label>
              <select
                id="expense-category"
                className="select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="add-expense-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label className="form-label" htmlFor="expense-note">Note (optional)</label>
              <input
                id="expense-note"
                type="text"
                className="input"
                placeholder="What was this for?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={100}
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="expense-date">Date</label>
              <input
                id="expense-date"
                type="date"
                className="input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}

          <button
            type="submit"
            className={`btn ${success ? 'btn-teal' : 'btn-primary'} add-expense-submit`}
            disabled={loading}
          >
            {loading ? (
              <span className="btn-loader" />
            ) : success ? (
              '✓ Added!'
            ) : (
              'Add Expense'
            )}
          </button>
        </form>
      )}
    </div>
  );
}
