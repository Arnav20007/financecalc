import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/compound-interest-calculator', label: 'Compound Interest' },
    { path: '/loan-payoff-calculator', label: 'Loan Payoff' },
    { path: '/retirement-calculator', label: 'Retirement' },
    { path: '/inflation-calculator', label: 'Inflation' },
    { path: '/debt-snowball-calculator', label: 'Debt Snowball' },
];

export default function Header() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    return (
        <>
            <header className="site-header">
                <div className="header-inner">
                    <Link to="/" className="header-logo" aria-label="FinanceCalc Home">
                        <span className="logo-icon">FC</span>
                        FinanceCalc
                    </Link>
                    <nav className="header-nav" aria-label="Main navigation">
                        {navLinks.map(link => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={location.pathname === link.path ? 'active' : ''}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setMobileOpen(true)}
                        aria-label="Open menu"
                    >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </header>

            {/* Mobile Navigation */}
            <div className={`mobile-nav ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(false)}>
                <div className="mobile-nav-panel" onClick={e => e.stopPropagation()}>
                    <button className="mobile-nav-close" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                        ✕
                    </button>
                    <div className="mobile-nav-links">
                        {navLinks.map(link => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setMobileOpen(false)}
                                className={location.pathname === link.path ? 'active' : ''}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
