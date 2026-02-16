import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import CurrencySelector from '../common/CurrencySelector';

const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/compound-interest-calculator', label: 'Compound Interest' },
    { path: '/loan-payoff-calculator', label: 'Loan Payoff' },
    { path: '/retirement-calculator', label: 'Retirement' },
    { path: '/inflation-calculator', label: 'Inflation' },
    { path: '/debt-snowball-calculator', label: 'Debt Payoff' },
];

export default function Header() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();

    return (
        <>
            <header className="site-header">
                <div className="header-inner">
                    <Link to="/" className="header-logo">
                        <span className="logo-icon">FC</span>
                        FinanceCalc
                    </Link>

                    <nav className="header-nav">
                        {navLinks.map(link => (
                            <NavLink key={link.path} to={link.path} end={link.path === '/'}
                                className={({ isActive }) => isActive ? 'active' : ''}>
                                {link.label}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="header-actions">
                        <CurrencySelector />
                        <button
                            className="theme-toggle"
                            onClick={toggleTheme}
                            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                        >
                            <span className="theme-toggle-track">
                                <span className="theme-toggle-thumb">
                                    {theme === 'dark' ? (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                        </svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="5" />
                                            <line x1="12" y1="1" x2="12" y2="3" />
                                            <line x1="12" y1="21" x2="12" y2="23" />
                                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                            <line x1="1" y1="12" x2="3" y2="12" />
                                            <line x1="21" y1="12" x2="23" y2="12" />
                                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                                        </svg>
                                    )}
                                </span>
                            </span>
                        </button>

                        <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)} aria-label="Open menu">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <line x1="3" y1="12" x2="21" y2="12" />
                                <line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            <div className={`mobile-nav ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(false)}>
                <div className="mobile-nav-panel" onClick={e => e.stopPropagation()}>
                    <button className="mobile-nav-close" onClick={() => setMobileOpen(false)} aria-label="Close menu">✕</button>

                    <div className="mobile-theme-toggle" style={{ marginTop: '3rem', marginBottom: '1rem', padding: '0 1rem' }}>
                        <button
                            className="theme-toggle-mobile"
                            onClick={toggleTheme}
                            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                        >
                            {theme === 'dark' ? (
                                <>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                        <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                                    </svg>
                                    Switch to Light Mode
                                </>
                            ) : (
                                <>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                    </svg>
                                    Switch to Dark Mode
                                </>
                            )}
                        </button>
                    </div>

                    <nav className="mobile-nav-links">
                        {navLinks.map(link => (
                            <NavLink key={link.path} to={link.path} end={link.path === '/'}
                                className={({ isActive }) => isActive ? 'active' : ''}
                                onClick={() => setMobileOpen(false)}>
                                {link.label}
                            </NavLink>
                        ))}
                    </nav>
                </div>
            </div>
        </>
    );
}
