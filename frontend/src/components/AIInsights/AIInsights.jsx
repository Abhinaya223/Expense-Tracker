import { useState, useMemo } from 'react';
import { useExpenses } from '../../contexts/ExpenseContext';
import { useGoal } from '../../contexts/GoalContext';
import { getMonthExpenses, getCurrentMonthYear } from '../../utils/helpers';
import { askGeminiFinanceAssistant } from '../../services/geminiService';
import './AIInsights.css';

export default function AIInsights() {
  const { expenses } = useExpenses();
  const { budget } = useGoal();
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const monthExpenses = useMemo(() => getMonthExpenses(expenses), [expenses]);
  const { label: monthLabel } = getCurrentMonthYear();

  const spendingData = useMemo(() => {
    const total = monthExpenses.reduce((s, e) => s + (e.amount || 0), 0);
    const categories = {};
    monthExpenses.forEach((e) => {
      categories[e.category] = (categories[e.category] || 0) + (e.amount || 0);
    });
    return {
      total,
      budget,
      categories,
      transactionCount: monthExpenses.length,
      month: monthLabel,
      expensesList: monthExpenses,
    };
  }, [monthExpenses, budget, monthLabel]);

  async function handleAskAI(customPrompt) {
    const promptToUse = customPrompt !== undefined ? customPrompt : query;
    setLoading(true);
    setError('');
    setActiveQuery(promptToUse || 'General Spending Analysis');

    try {
      const result = await askGeminiFinanceAssistant(promptToUse, spendingData);
      setResponse(result);
    } catch (err) {
      setError(
        err.message || 'Failed to get a response from Gemini AI. Please check your network and API key.'
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!query.trim() || loading) return;
    handleAskAI(query.trim());
  }

  const suggestionChips = [
    { label: '✨ Analyze Spending', prompt: '' },
    { label: '💡 How is my budget doing?', prompt: 'How am I doing relative to my monthly budget?' },
    { label: '🛒 What is my highest category?', prompt: 'Which spending category is my highest and what percentage is it of my total?' },
  ];

  return (
    <div className="ai-insights card">
      <div className="card-header">
        <h2 className="card-title">
          <span className="ai-icon">🤖</span> AI Finance Assistant
        </h2>
        <span className="ai-badge">Gemini 2.5 Flash</span>
      </div>

      <p className="ai-description text-muted">
        Ask anything about your expenses, savings, and budget habits.
      </p>

      {/* Quick Suggestion Chips */}
      <div className="ai-chips">
        {suggestionChips.map((chip, idx) => (
          <button
            key={idx}
            className="ai-chip-btn"
            onClick={() => {
              setQuery(chip.prompt);
              handleAskAI(chip.prompt);
            }}
            disabled={loading || monthExpenses.length === 0}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Custom Query Input */}
      <form onSubmit={handleSubmit} className="ai-input-form">
        <div className="ai-input-wrapper">
          <input
            type="text"
            className="input"
            placeholder={
              monthExpenses.length === 0
                ? 'Add expenses first to chat with AI...'
                : 'Ask AI about your spending (e.g. "How much did I spend on food?")'
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading || monthExpenses.length === 0}
          />
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={loading || !query.trim() || monthExpenses.length === 0}
          >
            {loading ? 'Thinking...' : 'Ask'}
          </button>
        </div>
      </form>

      {monthExpenses.length === 0 && (
        <p className="text-muted ai-empty-notice">
          💡 Add at least one expense to enable the AI Finance Assistant.
        </p>
      )}

      {/* Loading State */}
      {loading && (
        <div className="ai-insights-loading">
          <div className="ai-typing">
            <span />
            <span />
            <span />
          </div>
          <p className="text-muted">Analyzing your data with Gemini AI...</p>
          <div className="shimmer" style={{ height: 16, marginTop: 8, width: '90%' }} />
          <div className="shimmer" style={{ height: 16, marginTop: 6, width: '75%' }} />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="ai-insights-error">
          <p className="error-message">⚠️ {error}</p>
          <button className="btn btn-ghost btn-sm" onClick={() => handleAskAI(query)}>
            Retry Call
          </button>
        </div>
      )}

      {/* Response Display */}
      {response && !loading && (
        <div className="ai-insights-result animate-fade-in">
          {activeQuery && (
            <div className="ai-query-tag">
              <strong>Query:</strong> {activeQuery}
            </div>
          )}
          <div className="ai-insights-text">{response}</div>
        </div>
      )}
    </div>
  );
}
