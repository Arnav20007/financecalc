import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
    ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import SEOHead from '../components/common/SEOHead';
import FAQSection from '../components/common/FAQSection';
import TryNextCalculator from '../components/common/TryNextCalculator';
import InternalLinks from '../components/common/InternalLinks';
import AdSlot from '../components/common/AdSlot';
import ShareButton from '../components/common/ShareButton';
import ValidatedInput from '../components/common/ValidatedInput';
import PrivacyBadge from '../components/common/PrivacyBadge';
import { useCurrency } from '../context/CurrencyContext';
import { calculateLoanPayoff } from '../utils/calculations';
import { formatMonthsToYears } from '../utils/formatters';
import { generatePDF } from '../utils/pdfGenerator';
import { useValidatedInputs } from '../utils/useValidatedInput';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

const faqs = [
    { question: 'What is an amortization schedule?', answer: 'An amortization schedule is a complete table of periodic loan payments showing the amount of principal and interest that comprise each payment until the loan is paid off at the end of its term.' },
    { question: 'How is loan interest calculated?', answer: 'Most loans use simple interest on the remaining balance. Each month, the interest charge equals the outstanding balance multiplied by the monthly interest rate (annual rate ÷ 12).' },
    { question: 'Should I make extra payments on my loan?', answer: 'Making extra payments can significantly reduce the total interest paid and the loan duration. Even small additional amounts applied to principal each month can save thousands over the life of a loan.' },
    { question: 'What is the difference between APR and interest rate?', answer: 'The interest rate is the cost of borrowing the principal amount. The APR includes the interest rate plus other costs like origination fees, closing costs, and insurance.' },
    { question: 'How do I calculate my minimum monthly payment?', answer: 'For a standard amortizing loan, the minimum payment is calculated using the formula: M = P[r(1+r)^n]/[(1+r)^n-1], where P is the principal, r is the monthly interest rate, and n is the number of payments.' },
    { question: 'What are prepayment penalties?', answer: 'A prepayment penalty is a fee charged by some lenders if you pay off all or part of your loan significantly earlier than the agreed-upon term. Most modern mortgages and auto loans do not have these, but you should always check your loan agreement before making large extra payments.' },
    { question: 'Is it better to pay off my mortgage or invest the extra cash?', answer: 'This depends on your loan’s interest rate versus your expected investment return. If your mortgage rate is 3% and the stock market returns 7-10%, investing might be mathematically better. However, paying off debt provides a "guaranteed" return equal to the interest rate and significant peace of mind.' },
    { question: 'How do bi-weekly payments work?', answer: 'Bi-weekly payments involve making half your monthly payment every two weeks. Because there are 52 weeks in a year, you end up making 26 half-payments, which equals 13 full payments instead of the usual 12. This simple switch can shave years off a 30-year mortgage.' },
    { question: 'Can I change my loan term mid-way?', answer: 'Typically, you cannot change the term of your current contract without refinancing. However, by making extra payments as shown in our calculator, you effectively shorten the term yourself without having to pay for a new loan origination.' },
    { question: 'What happens if I miss a loan payment?', answer: 'Missing a payment can lead to late fees, an increase in your interest rate (if it’s a variable or penalty-based loan), and significant damage to your credit score. If you’re struggling, contact your lender immediately to discuss "forbearance" or "deferment" options.' },
    { question: 'Is this calculator suitable for mortgage calculations?', answer: 'Yes, this calculator works for any fixed-rate amortizing loan including mortgages, auto loans, personal loans, and student loans.' },
];

const validationRules = {
    amount: { label: 'Loan Amount', min: 1, max: 100000000, required: true },
    rate: { label: 'Interest Rate', min: 0.1, max: 50, allowDecimal: true, required: true },
    payment: { label: 'Monthly Payment', min: 1, max: 10000000, required: true },
};

export default function LoanPayoffCalculator() {
    const { formatCurrency, symbol } = useCurrency();
    const { values: inputs, errors, touched, handleChange, handleBlur, validateAll, getNumericValue, setValues } = useValidatedInputs(
        { amount: '250000', rate: '6.5', payment: '2000' },
        validationRules
    );
    const [results, setResults] = useState(null);
    const [calcError, setCalcError] = useState('');
    const [compareMode, setCompareMode] = useState(false);
    const [comparePayment, setComparePayment] = useState('2500');
    const [compareResults, setCompareResults] = useState(null);
    const [copied, setCopied] = useState(false);
    const resultsRef = useRef(null);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const loadExample = () => {
        setValues({ amount: '350000', rate: '7.25', payment: '2500' });
        setResults(null); setCalcError('');
    };

    const handleCalculate = (e) => {
        e.preventDefault();
        setCalcError('');
        if (!validateAll()) return;
        const result = calculateLoanPayoff(getNumericValue('amount'), getNumericValue('rate'), getNumericValue('payment'));
        if (result.error) { setCalcError(result.error); setResults(null); return; }
        setResults(result);
        if (compareMode) {
            const cResult = calculateLoanPayoff(getNumericValue('amount'), getNumericValue('rate'), parseFloat(comparePayment) || 0);
            setCompareResults(cResult.error ? null : cResult);
        }
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    };

    const handleDownloadPDF = () => {
        if (!results) return;
        generatePDF('Loan Payoff Schedule', [
            { label: 'Loan Amount', value: formatCurrency(getNumericValue('amount')) },
            { label: 'Interest Rate', value: `${inputs.rate}%` },
            { label: 'Monthly Payment', value: formatCurrency(getNumericValue('payment')) },
            { label: 'Payoff Time', value: formatMonthsToYears(results.totalMonths) },
            { label: 'Total Interest Paid', value: formatCurrency(results.totalInterest) },
            { label: 'Total Amount Paid', value: formatCurrency(results.totalPayments) },
        ], results.annualSummary, [
            { header: 'Year', accessor: r => r.year },
            { header: 'Payments', accessor: r => formatCurrency(r.totalPayments) },
            { header: 'Principal', accessor: r => formatCurrency(r.totalPrincipal) },
            { header: 'Interest', accessor: r => formatCurrency(r.totalInterest) },
            { header: 'Remaining', accessor: r => formatCurrency(r.endBalance) },
        ]);
    };

    const chartOptions = {
        responsive: true, maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top', labels: { color: '#94a3b8', padding: 16, usePointStyle: true } },
            tooltip: {
                backgroundColor: 'rgba(15, 22, 41, 0.95)', titleColor: '#f1f5f9', bodyColor: '#94a3b8',
                borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, padding: 12, cornerRadius: 8,
                callbacks: { label: ctx => `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}` },
            },
        },
        scales: {
            y: { ticks: { callback: v => formatCurrency(v), color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' }, border: { color: 'transparent' } },
            x: { grid: { display: false }, ticks: { color: '#64748b' }, border: { color: 'transparent' } },
        },
    };

    const lineChartData = results ? {
        labels: results.annualSummary.map(r => `Year ${r.year}`),
        datasets: [
            {
                label: 'Remaining Balance', data: results.annualSummary.map(r => r.endBalance),
                borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.08)',
                fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#ef4444',
            },
            ...(compareMode && compareResults ? [{
                label: `Scenario B (${symbol}${comparePayment}/mo)`,
                data: compareResults.annualSummary.map(r => r.endBalance),
                borderColor: '#8b5cf6', backgroundColor: 'rgba(139, 92, 246, 0.05)',
                fill: false, tension: 0.4, pointRadius: 3, borderDash: [8, 4],
                pointBackgroundColor: '#8b5cf6',
            }] : []),
        ],
    } : null;

    const doughnutData = results ? {
        labels: ['Principal', 'Total Interest'],
        datasets: [{
            data: [getNumericValue('amount'), results.totalInterest],
            backgroundColor: ['rgba(59, 130, 246, 0.6)', 'rgba(249, 115, 22, 0.6)'],
            borderColor: ['rgba(59, 130, 246, 0.9)', 'rgba(249, 115, 22, 0.9)'],
            borderWidth: 2,
        }],
    } : null;

    return (
        <div className="calculator-page">
            <SEOHead title="Loan Payoff Calculator — Free Amortization Schedule Tool" description="Calculate your loan payoff timeline with a complete amortization schedule." canonical="/loan-payoff-calculator" faqSchema={faqs} />
            <nav className="breadcrumbs"><Link to="/">Home</Link><span>/</span><span>Loan Payoff Calculator</span></nav>

            <section className="calculator-hero">
                <h1>Loan Payoff Calculator</h1>
                <p className="hero-subtitle">See your complete amortization schedule, total interest costs, and payoff timeline for any fixed-rate loan.</p>
            </section>

            <form className="calculator-form" onSubmit={handleCalculate} id="loan-payoff-form" noValidate>
                <div className="form-top-actions">
                    <button type="button" className="btn-load-example" onClick={loadExample}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14,2 14,8 20,8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                        Load Example
                    </button>
                </div>
                <div className="form-grid">
                    <ValidatedInput name="amount" label="Loan Amount" value={inputs.amount} onChange={handleChange} onBlur={handleBlur} error={errors.amount} touched={touched.amount} prefix={symbol} min={1} step={1000} />
                    <ValidatedInput name="rate" label="Annual Interest Rate" hint="(%)" value={inputs.rate} onChange={handleChange} onBlur={handleBlur} error={errors.rate} touched={touched.rate} suffix="%" min={0.1} max={50} step={0.1} />
                    <ValidatedInput name="payment" label="Monthly Payment" value={inputs.payment} onChange={handleChange} onBlur={handleBlur} error={errors.payment} touched={touched.payment} prefix={symbol} min={1} step={50} className="full-width" />
                </div>
                {compareMode && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 'var(--radius-md)' }}>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#8b5cf6', marginBottom: '0.5rem', display: 'block' }}>Scenario B — Monthly Payment ({symbol})</label>
                        <input type="number" className="form-input" value={comparePayment} onChange={e => setComparePayment(e.target.value)} min="0" step="100" />
                    </div>
                )}
                {calcError && <p style={{ color: 'var(--color-error)', marginTop: '0.75rem', fontSize: '0.875rem', padding: '0.75rem', background: 'rgba(239,68,68,0.08)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>{calcError}</p>}
                <button type="submit" className="btn-calculate" id="calculate-loan-payoff" style={{ marginTop: '1.25rem' }}>Calculate Loan Payoff</button>
                <PrivacyBadge />
            </form>

            {results && (
                <div className="results-section" ref={resultsRef}>
                    <div className="results-summary">
                        <div className="result-card highlight"><div className="result-label">Payoff Time</div><div className="result-value small">{formatMonthsToYears(results.totalMonths)}</div></div>
                        <div className="result-card"><div className="result-label">Total Payments</div><div className="result-value small">{formatCurrency(results.totalPayments)}</div></div>
                        <div className="result-card" style={{ borderColor: 'rgba(249, 115, 22, 0.3)' }}><div className="result-label">Total Interest Paid</div><div className="result-value small" style={{ color: '#f97316' }}>{formatCurrency(results.totalInterest)}</div></div>
                    </div>

                    <div className="chart-section"><h3>Balance Over Time</h3><div className="chart-container"><Line data={lineChartData} options={chartOptions} /></div></div>
                    <div className="chart-section"><h3>Principal vs Interest</h3><div style={{ maxWidth: 300, margin: '0 auto' }}>
                        <Doughnut data={doughnutData} options={{ responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } }, tooltip: { backgroundColor: 'rgba(15,22,41,0.95)', titleColor: '#f1f5f9', bodyColor: '#94a3b8', callbacks: { label: ctx => `${ctx.label}: ${formatCurrency(ctx.raw)}` } } } }} />
                    </div></div>



                    <div className="data-table-wrapper">
                        <div className="data-table-header"><h3>Annual Amortization Summary</h3></div>
                        <div className="data-table-scroll">
                            <table className="data-table">
                                <thead><tr><th>Year</th><th>Payments</th><th>Principal Paid</th><th>Interest Paid</th><th>Remaining Balance</th></tr></thead>
                                <tbody>{results.annualSummary.map(row => (
                                    <tr key={row.year}><td>{row.year}</td><td>{formatCurrency(row.totalPayments)}</td><td style={{ color: '#3b82f6' }}>{formatCurrency(row.totalPrincipal)}</td><td style={{ color: '#f97316' }}>{formatCurrency(row.totalInterest)}</td><td><strong>{formatCurrency(row.endBalance)}</strong></td></tr>
                                ))}</tbody>
                            </table>
                        </div>
                    </div>

                    <div className="actions-bar">
                        <button className="btn-action" onClick={handleDownloadPDF} type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7,10 12,15 17,10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>Download PDF</button>
                        <ShareButton title="Loan Payoff Results" text={`My ${formatCurrency(getNumericValue('amount'))} loan at ${inputs.rate}% will be paid off in ${formatMonthsToYears(results.totalMonths)}.`} />
                        <button className="btn-action" onClick={handleCopyLink} type="button">
                            {copied ? (
                                <><svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg> Copied!</>
                            ) : (
                                <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg> Copy Link</>
                            )}
                        </button>
                        <button className="btn-action" onClick={() => { setCompareMode(!compareMode); setCompareResults(null); }} type="button">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3h5v5" /><path d="M8 3H3v5" /><path d="M21 3l-7 7" /><path d="M3 3l7 7" /></svg>
                            {compareMode ? 'Hide Compare' : 'Compare Scenarios'}
                        </button>
                    </div>

                    {compareMode && compareResults && (
                        <div className="compare-results" style={{ marginTop: '1rem' }}>
                            <div className="compare-column scenario-a">
                                <h4>Scenario A ({symbol}{inputs.payment}/mo)</h4>
                                <div className="result-label">Payoff Time</div>
                                <div className="result-value small">{formatMonthsToYears(results.totalMonths)}</div>
                                <div className="result-label" style={{ marginTop: '0.5rem' }}>Total Interest</div>
                                <div className="result-value small">{formatCurrency(results.totalInterest)}</div>
                            </div>
                            <div className="compare-column scenario-b">
                                <h4>Scenario B ({symbol}{comparePayment}/mo)</h4>
                                <div className="result-label">Payoff Time</div>
                                <div className="result-value small">{formatMonthsToYears(compareResults.totalMonths)}</div>
                                <div className="result-label" style={{ marginTop: '0.5rem' }}>Total Interest</div>
                                <div className="result-value small">{formatCurrency(compareResults.totalInterest)}</div>
                                <div className="result-label" style={{ marginTop: '0.5rem', color: '#10b981', fontWeight: 600 }}>You Save: {formatCurrency(results.totalInterest - compareResults.totalInterest)}</div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <InternalLinks currentPath="/loan-payoff-calculator" />
            <section className="seo-content" id="seo">
                <h2>The Ultimate Guide to Mastering Loan Payoff & Amortization</h2>
                <p>Taking out a loan is a major financial commitment, whether it's for a home, a car, or personal expenses. Understanding exactly how your loan works — and how you can pay it off faster — is one of the most effective ways to save tens of thousands of dollars over your lifetime. Our Loan Payoff Calculator is designed to give you complete transparency into your debt, showing you exactly where every cent of your hard-earned money goes.</p>

                <h3>What is Loan Amortization and Why Does It Matter?</h3>
                <p>Amortization is the process of spreading out a loan into a series of fixed payments. While your total monthly payment typically stays the same for a fixed-rate loan, the <strong>inner composition</strong> of that payment changes every month. In the early years of a 30-year mortgage or a 5-year auto loan, the vast majority of your payment goes toward <strong>interest</strong>, with only a small sliver reducing your actual <strong>principal balance</strong>. As the balance decreases, the interest calculated on that balance also decreases, allowing more of your payment to go toward principal in the later years.</p>
                <p>By visualizing this schedule with our calculator, you can see the "tipping point" where your payments finally begin to make a significant dent in your debt.</p>

                <h3>The Math Behind the Savings: Why Extra Payments are So Powerful</h3>
                <p>The secret to beating the bank at its own game is simple: <strong>Principal Reduction</strong>. When you make an extra payment, 100% of that money goes toward reducing the principal balance. Because interest is calculated based on that balance, every dollar you pay today prevents years of interest from accumulating on that same dollar in the future.</p>
                <p>For example, adding just $100 per month to a $250,000 mortgage at 6% interest can shave nearly 4 years off the loan term and save you over $45,000 in interest. That's a massive return on investment for a relatively small monthly sacrifice.</p>

                <h3>Decoding Debt Strategies: Snowball vs. Avalanche</h3>
                <p>If you're managing multiple loans, choosing the right strategy is key to staying motivated:</p>
                <ul>
                    <li><strong>The Debt Avalanche:</strong> You pay minimums on everything and put all extra cash toward the loan with the <strong>highest interest rate</strong> first. Mathematically, this is the most efficient way to pay off debt and saves the most money.</li>
                    <li><strong>The Debt Snowball:</strong> You pay minimums on everything and put all extra cash toward the loan with the <strong>smallest balance</strong> first. Psychologically, this provides "quick wins" that help many people stay focused on their long-term goals.</li>
                </ul>

                <h3>Strategic Refinancing: When to Move Your Mortgage</h3>
                <p>Refinancing is the process of replacing your current loan with a new one, typically at a lower interest rate or with a different term length. But when does it actually make sense? Generally, experts recommend looking at a refinance if interest rates have dropped by at least 1% below your current rate. However, you must also consider the <strong>closing costs</strong>. Use our calculator to determine how much your monthly payment would decrease and calculate your "break-even point" — how many months it will take for your monthly savings to cover the initial cost of refinancing.</p>

                <h3>Common Pitfalls to Avoid with Loans</h3>
                <p>While loans are useful tools, they can lead to financial strain if managed poorly. Be aware of these common traps:</p>
                <ul>
                    <li><strong>Only Paying Interest:</strong> Some loans (like specific student loans or HELOCs) allow for "interest-only" payments. While this keeps your monthly cost low, it means your debt never actually goes away.</li>
                    <li><strong>Ignoring the APR:</strong> The interest rate is not your total cost. The Annual Percentage Rate (APR) includes fees and other costs, giving you a truer sense of what you're actually paying.</li>
                    <li><strong>Variable Rate Risk:</strong> Floating or adjustable-rate mortgages (ARMs) might start with low payments, but they can spike significantly if market rates rise, potentially leading to "payment shock."</li>
                </ul>

                <h3>Top Tips for Early Debt Retirement</h3>
                <ol>
                    <li><strong>Round up your payments:</strong> If your car payment is $463, pay $500. It's a small change that becomes a powerful habit over time.</li>
                    <li><strong>Use windfalls wisely:</strong> When you get a tax refund or a work bonus, consider putting 50% of it toward your highest-interest debt.</li>
                    <li><strong>Check for prepayment penalties:</strong> Before aggressively paying off a loan, ensure your lender doesn't charge fees for early payoff (most modern mortgages and auto loans do not, but it's always worth checking).</li>
                </ol>
            </section>
            <FAQSection faqs={faqs} />

            <TryNextCalculator currentPath="/loan-payoff-calculator" />
        </div>
    );
}
