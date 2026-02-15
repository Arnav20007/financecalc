import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { lazy, Suspense } from 'react';
import Layout from './components/Layout/Layout';
import { ThemeProvider } from './context/ThemeContext';

// Lazy-loaded pages for optimal bundle splitting
const Home = lazy(() => import('./pages/Home'));
const CompoundInterestCalculator = lazy(() => import('./pages/CompoundInterestCalculator'));
const LoanPayoffCalculator = lazy(() => import('./pages/LoanPayoffCalculator'));
const RetirementCalculator = lazy(() => import('./pages/RetirementCalculator'));
const InflationCalculator = lazy(() => import('./pages/InflationCalculator'));
const DebtSnowballCalculator = lazy(() => import('./pages/DebtSnowballCalculator'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'));
const Disclaimer = lazy(() => import('./pages/Disclaimer'));

function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: '0.75rem',
    }}>
      <div className="spinner" style={{
        borderColor: 'rgba(37, 99, 235, 0.2)',
        borderTopColor: '#2563eb',
      }} />
      <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Loading...</span>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <HelmetProvider>
        <Router>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="/compound-interest-calculator" element={<CompoundInterestCalculator />} />
                <Route path="/loan-payoff-calculator" element={<LoanPayoffCalculator />} />
                <Route path="/retirement-calculator" element={<RetirementCalculator />} />
                <Route path="/inflation-calculator" element={<InflationCalculator />} />
                <Route path="/debt-snowball-calculator" element={<DebtSnowballCalculator />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                <Route path="/disclaimer" element={<Disclaimer />} />
                <Route path="*" element={
                  <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                    <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>404</h1>
                    <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>Page not found.</p>
                    <a href="/" style={{
                      display: 'inline-flex',
                      marginTop: '1.5rem',
                      padding: '0.75rem 2rem',
                      background: 'var(--gradient-primary)',
                      color: 'white',
                      borderRadius: '8px',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}>Back to Home</a>
                  </div>
                } />
              </Route>
            </Routes>
          </Suspense>
        </Router>
      </HelmetProvider>
    </ThemeProvider>
  );
}
