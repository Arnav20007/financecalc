import { Link } from 'react-router-dom';
import SEOHead from '../components/common/SEOHead';
import AdSlot from '../components/common/AdSlot';

const calculators = [
    {
        icon: '📈', title: 'Compound Interest Calculator',
        description: 'See how your investments grow over time with the magic of compound interest and regular contributions.',
        path: '/compound-interest-calculator',
        tags: ['Investing', 'Savings', 'Growth'],
        image: '/images/calc-compound.svg',
    },
    {
        icon: '🏦', title: 'Loan Payoff Calculator',
        description: 'Get a complete amortization schedule and find the fastest way to pay off your mortgage or personal loan.',
        path: '/loan-payoff-calculator',
        tags: ['Mortgage', 'Debt', 'Amortization'],
        image: '/images/calc-loan.svg',
    },
    {
        icon: '🏖️', title: 'Retirement Calculator',
        description: 'Project your retirement nest egg and estimated monthly income based on your savings strategy.',
        path: '/retirement-calculator',
        tags: ['Retirement', '401K', 'Planning'],
        image: '/images/calc-retirement.svg',
    },
    {
        icon: '💹', title: 'Inflation Calculator',
        description: 'Understand how inflation erodes your purchasing power and plan for rising costs over the years.',
        path: '/inflation-calculator',
        tags: ['Inflation', 'Purchasing Power', 'CPI'],
        image: '/images/calc-inflation.svg',
    },
    {
        icon: '⚡', title: 'Debt Snowball Calculator',
        description: 'Compare snowball vs. avalanche payoff strategies and find the fastest path to becoming debt-free.',
        path: '/debt-snowball-calculator',
        tags: ['Debt Free', 'Snowball', 'Avalanche'],
        image: '/images/calc-debt.svg',
    },
];

export default function Home() {
    return (
        <div className="home-page">
            <SEOHead
                title="FinanceCalc — Free Professional Financial Calculators"
                description="Free professional-grade financial calculators for compound interest, loan payoff, retirement planning, inflation analysis, and debt snowball strategies."
                canonical="/"
            />

            <section className="home-hero">
                <div className="hero-content">
                    <h1>Master Your Money<br />with Precision Tools</h1>
                    <p>Make smarter money decisions with accurate financial projections — trusted by thousands of users worldwide. Completely free, no sign-up required.</p>
                    <div className="trust-badges">
                        <div className="trust-badge">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                            100% Free
                        </div>
                        <div className="trust-badge">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                            No Sign-Up Required
                        </div>
                        <div className="trust-badge">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                            PDF Export
                        </div>
                        <div className="trust-badge">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                            Mobile Optimized
                        </div>
                    </div>
                    <Link to="/compound-interest-calculator" className="hero-cta">
                        Get Started — It's Free
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12,5 19,12 12,19" /></svg>
                    </Link>
                </div>
                <div className="hero-illustration">
                    <img src="/images/hero-illustration.svg" alt="Financial growth chart illustration" width="600" height="400" />
                </div>
            </section>

            <section className="calculators-section">
                <div className="section-header">
                    <h2>Powerful Financial Calculators</h2>
                    <p>Pick a tool and start planning your financial future in seconds.</p>
                </div>
                <div className="calc-grid">
                    {calculators.map(calc => (
                        <Link to={calc.path} key={calc.path} className="calc-card" id={`card-${calc.path.slice(1)}`}>
                            <div className="calc-card-image">
                                <img src={calc.image} alt={calc.title} width="200" height="200" loading="lazy" />
                            </div>
                            <div className="calc-card-body">
                                <h3>{calc.title}</h3>
                                <p>{calc.description}</p>
                                <div className="calc-card-tags">
                                    {calc.tags.map(tag => (
                                        <span key={tag} className="calc-tag">{tag}</span>
                                    ))}
                                </div>
                                <span className="calc-card-link">
                                    Open Calculator
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12,5 19,12 12,19" /></svg>
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="features-section">
                <div className="section-header">
                    <h2>Why Choose FinanceCalc?</h2>
                    <p>Everything you need for smarter financial decisions.</p>
                </div>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                        </div>
                        <h3>Bank-Grade Accuracy</h3>
                        <p>Calculations verified against industry-standard financial formulas used by professional advisors.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>
                        </div>
                        <h3>Interactive Charts</h3>
                        <p>Beautiful visualizations that make complex data easy to understand at a glance.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7,10 12,15 17,10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                        </div>
                        <h3>PDF Reports</h3>
                        <p>Download detailed reports to share with your partner, advisor, or keep for records.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>
                        </div>
                        <h3>Mobile First</h3>
                        <p>Fully responsive design that works beautifully on any device — phone, tablet, or desktop.</p>
                    </div>
                </div>
            </section>

            <section className="seo-content">
                <h2>Plan for Every Stage of Life</h2>
                <p>Whether you're just starting to invest, buying your first home, planning for retirement, or aggressively paying off debt, our calculators provide the detailed projections and insights you need to make informed decisions.</p>
                <h2>Accurate, Transparent Calculations</h2>
                <p>Every calculator shows its work with detailed breakdowns, year-by-year tables, and interactive charts. Download your results as a PDF to share with your spouse, financial advisor, or keep for your records.</p>
            </section>

        </div>
    );
}
