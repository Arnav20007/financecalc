import { Link } from 'react-router-dom';
import SEOHead from '../components/common/SEOHead';
import AdSlot from '../components/common/AdSlot';

const calculators = [
    {
        path: '/compound-interest-calculator',
        icon: '📈',
        title: 'Compound Interest Calculator',
        description: 'Calculate how your investments grow over time with the power of compound interest. See annual breakdowns, total returns, and visualize your wealth trajectory.',
        tags: ['Investment', 'Savings', 'Growth'],
    },
    {
        path: '/loan-payoff-calculator',
        icon: '🏦',
        title: 'Loan Payoff Calculator',
        description: 'Generate a complete amortization schedule for any loan. See exactly how much interest you\'ll pay and when you\'ll be debt-free.',
        tags: ['Mortgage', 'Auto Loan', 'Debt'],
    },
    {
        path: '/retirement-calculator',
        icon: '🏖️',
        title: 'Retirement Calculator',
        description: 'Project your retirement nest egg and estimate how much monthly income you can expect. Plan your financial independence today.',
        tags: ['401(k)', 'IRA', 'Planning'],
    },
    {
        path: '/inflation-calculator',
        icon: '💹',
        title: 'Inflation Calculator',
        description: 'Understand how inflation impacts your money over time. See the future cost of goods and real purchasing power of your savings.',
        tags: ['CPI', 'Purchasing Power', 'Economy'],
    },
    {
        path: '/debt-snowball-calculator',
        icon: '⛄',
        title: 'Debt Snowball Calculator',
        description: 'Optimize your debt payoff strategy. Compare snowball vs. avalanche methods and see how much interest you can save.',
        tags: ['Credit Card', 'Strategy', 'Freedom'],
    },
];

export default function Home() {
    return (
        <>
            <SEOHead
                title="Free Financial Calculators — Investment, Loan, Retirement & Debt Tools"
                description="Professional financial calculators for compound interest, loan payoff, retirement planning, inflation analysis, and debt snowball strategies. Make smarter money decisions with accurate projections."
                canonical="/"
            />

            <section className="home-hero">
                <h1>Smart Financial Calculators<br />for Better Money Decisions</h1>
                <p>
                    Professional-grade financial tools trusted by thousands. Calculate compound interest,
                    plan your retirement, optimize debt payoff, and more — completely free.
                </p>
                <div className="trust-badges">
                    <div className="trust-badge">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5zm-1 14.59l-3.29-3.3 1.41-1.41L11 13.76l4.88-4.88 1.41 1.41L11 16.59z" /></svg>
                        100% Free
                    </div>
                    <div className="trust-badge">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5zm-1 14.59l-3.29-3.3 1.41-1.41L11 13.76l4.88-4.88 1.41 1.41L11 16.59z" /></svg>
                        No Registration Required
                    </div>
                    <div className="trust-badge">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5zm-1 14.59l-3.29-3.3 1.41-1.41L11 13.76l4.88-4.88 1.41 1.41L11 16.59z" /></svg>
                        Accurate & Trusted
                    </div>
                </div>
            </section>

            <AdSlot type="header" />

            <section aria-labelledby="calculators-heading">
                <h2 id="calculators-heading" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                    Financial Planning Tools
                </h2>
                <p style={{ textAlign: 'center', maxWidth: '550px', margin: '0 auto' }}>
                    Choose a calculator below to get started. Each tool provides detailed breakdowns, charts, and downloadable results.
                </p>

                <div className="calc-grid">
                    {calculators.map(calc => (
                        <Link key={calc.path} to={calc.path} className="calc-card" style={{ textDecoration: 'none' }}>
                            <div className="calc-card-icon">{calc.icon}</div>
                            <h3>{calc.title}</h3>
                            <p>{calc.description}</p>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                {calc.tags.map(tag => (
                                    <span key={tag} style={{
                                        fontSize: '0.6875rem',
                                        padding: '0.2rem 0.6rem',
                                        background: 'var(--color-gray-100)',
                                        borderRadius: '100px',
                                        color: 'var(--color-gray-600)',
                                        fontWeight: 500,
                                    }}>{tag}</span>
                                ))}
                            </div>
                            <span className="calc-card-link">Calculate Now</span>
                        </Link>
                    ))}
                </div>
            </section>

            <AdSlot type="mid-content" />

            {/* SEO Content */}
            <section className="seo-content" style={{ maxWidth: '800px', margin: '3rem auto 0' }}>
                <h2>Why Use FinanceCalc?</h2>
                <p>
                    Making informed financial decisions is one of the most impactful things you can do for your future.
                    Whether you're saving for retirement, paying off debt, or trying to understand how inflation affects your
                    purchasing power, FinanceCalc provides the tools you need to plan with confidence.
                </p>
                <p>
                    Our calculators use industry-standard formulas to provide accurate projections that help you understand
                    the true cost of borrowing, the real power of compound interest, and the importance of starting early
                    with your savings. Every tool is designed by financial professionals and continuously refined based on
                    user feedback.
                </p>

                <h2>Understanding Compound Interest</h2>
                <p>
                    Albert Einstein reportedly called compound interest "the eighth wonder of the world." Whether the
                    attribution is accurate or not, the math certainly is wonderful. When your investments earn returns,
                    those returns themselves start earning returns — creating exponential growth over time. Our compound
                    interest calculator lets you see exactly how this works with your specific numbers.
                </p>

                <h2>Smart Debt Management</h2>
                <p>
                    The average American household carries over $90,000 in debt. Understanding how to strategically
                    pay off that debt can save you thousands in interest and years of payments. Our loan payoff calculator
                    shows your complete amortization schedule, while the debt snowball calculator helps you find the optimal
                    payoff order for multiple debts.
                </p>

                <h2>Planning for Retirement</h2>
                <p>
                    Starting to save early is the single most important factor in retirement success. Even small monthly
                    contributions can grow to significant sums over decades thanks to compound growth. Our retirement
                    calculator helps you project how much you'll have at retirement and how much monthly income that
                    translates to.
                </p>

                <h2>Fighting Inflation</h2>
                <p>
                    Inflation silently erodes the value of your money every year. What costs $100 today could cost $180
                    in just 20 years at a 3% annual inflation rate. Understanding this force is essential for effective
                    financial planning. Our inflation calculator shows you exactly how your purchasing power changes over time.
                </p>
            </section>

            <AdSlot type="multiplex" />
        </>
    );
}
