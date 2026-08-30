import TopNav from '../TopNav/TopNav';
import HeroStats from '../HeroStats/HeroStats';
import AddExpense from '../AddExpense/AddExpense';
import ExpenseFeed from '../ExpenseFeed/ExpenseFeed';
import CategoryChart from '../CategoryChart/CategoryChart';
import Heatmap from '../Heatmap/Heatmap';
import GoalJar from '../GoalJar/GoalJar';
import AIInsights from '../AIInsights/AIInsights';
import './Dashboard.css';

export default function Dashboard() {
  return (
    <div className="dashboard">
      <TopNav />
      <main className="dashboard-main">

        {/* 1. Hero stats row — 3 equal cards full width */}
        <HeroStats />

        {/* 2. Two-column section: Left = form+feed, Right = AI+chart+jar */}
        <div className="dashboard-grid">
          <section className="dashboard-col-left">
            <AddExpense />
            <ExpenseFeed />
          </section>

          <section className="dashboard-col-right">
            <AIInsights />
            <CategoryChart />
            <GoalJar />
          </section>
        </div>

        {/* 3. Heatmap — full-width panel below the two-column section */}
        <section className="dashboard-heatmap-section">
          <Heatmap />
        </section>

      </main>
    </div>
  );
}
