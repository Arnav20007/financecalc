import { Link } from 'react-router-dom';

const calculatorLinks = [
    { path: '/compound-interest-calculator', label: 'Compound Interest Calculator' },
    { path: '/loan-payoff-calculator', label: 'Loan Payoff Calculator' },
    { path: '/retirement-calculator', label: 'Retirement Calculator' },
    { path: '/inflation-calculator', label: 'Inflation Calculator' },
    { path: '/debt-snowball-calculator', label: 'Debt Snowball Calculator' },
];

/**
 * InternalLinks — Chip-style internal navigation for SEO link equity
 */
export default function InternalLinks({ currentPath }) {
    const links = calculatorLinks.filter(l => l.path !== currentPath);

    return (
        <div className="internal-links">
            <h3>Related Financial Calculators</h3>
            <div className="internal-links-grid">
                {links.map(link => (
                    <Link key={link.path} to={link.path} className="internal-link-chip">
                        {link.label}
                    </Link>
                ))}
            </div>
        </div>
    );
}
