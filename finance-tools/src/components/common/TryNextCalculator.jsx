import { Link } from 'react-router-dom';

const allCalculators = [
    { path: '/compound-interest-calculator', name: 'Compound Interest Calculator', desc: 'See how your money grows over time with compound interest.' },
    { path: '/loan-payoff-calculator', name: 'Loan Payoff Calculator', desc: 'Visualize your amortization schedule and total interest.' },
    { path: '/retirement-calculator', name: 'Retirement Calculator', desc: 'Estimate your retirement savings and withdrawal income.' },
    { path: '/inflation-calculator', name: 'Inflation Calculator', desc: 'Understand how inflation erodes your purchasing power.' },
    { path: '/debt-snowball-calculator', name: 'Debt Snowball Calculator', desc: 'Find the fastest way to eliminate your debts.' },
];

/**
 * TryNextCalculator — Recommends other calculators
 */
export default function TryNextCalculator({ currentPath }) {
    const others = allCalculators.filter(c => c.path !== currentPath);

    return (
        <section className="try-next-section" aria-labelledby="try-next-heading">
            <h2 id="try-next-heading">Try Another Calculator</h2>
            <div className="try-next-grid">
                {others.map(calc => (
                    <Link key={calc.path} to={calc.path} className="try-next-card">
                        <h4>{calc.name}</h4>
                        <p>{calc.desc}</p>
                    </Link>
                ))}
            </div>
        </section>
    );
}
