import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ExpenseProvider } from './contexts/ExpenseContext';
import { GoalProvider } from './contexts/GoalContext';
import IntroScreen from './components/IntroScreen/IntroScreen';
import AuthScreen from './components/Auth/AuthScreen';
import Dashboard from './components/Dashboard/Dashboard';

function AppContent() {
  const { user, loading } = useAuth();
  // introComplete: true means onComplete fired — auth/app can render underneath.
  // introGone: true means we fully remove IntroScreen from the DOM (~650ms later).
  const [introComplete, setIntroComplete] = useState(false);
  const [introGone, setIntroGone] = useState(false);

  function handleIntroComplete() {
    setIntroComplete(true);
    // Remove the IntroScreen node from DOM after the zoom+flash finishes.
    // The CSS 'done' phase fades to opacity:0 in 0.35s; give it 700ms total.
    setTimeout(() => setIntroGone(true), 700);
  }

  return (
    <>
      {/* App content — renders underneath during the zoom-through */}
      <div
        style={{
          opacity: introComplete ? 1 : 0,
          transition: introComplete ? 'opacity 0.5s ease 0.1s' : 'none',
        }}
      >
        {loading ? (
          <div className="app-loader">
            <div className="loader-spinner" />
          </div>
        ) : user ? (
          <ExpenseProvider>
            <GoalProvider>
              <Dashboard />
            </GoalProvider>
          </ExpenseProvider>
        ) : (
          <AuthScreen />
        )}
      </div>

      {/* Intro overlay — sits on top; removed from DOM once zoom is done */}
      {!introGone && <IntroScreen onComplete={handleIntroComplete} />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
