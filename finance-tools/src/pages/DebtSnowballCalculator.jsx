import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
    Title, Tooltip, Legend, Filler
} from 'chart.js';
import SEOHead from '../components/common/SEOHead';
import FAQSection from '../components/common/FAQSection';
import TryNextCalculator from '../components/common/TryNextCalculator';
import InternalLinks from '../components/common/InternalLinks';
import AdSlot from '../components/common/AdSlot';
import ShareButton from '../components/common/ShareButton';
import { useCurrency } from '../context/CurrencyContext';
import { calculateDebtSnowball } from '../utils/calculations';
import { formatMonthsToYears } from '../utils/formatters';
import { generatePDF } from '../utils/pdfGenerator';
import PrivacyBadge from '../components/common/PrivacyBadge';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const faqs = [
    { question: 'What is the debt snowball method?', answer: 'The debt snowball method involves listing your debts from smallest to largest balance, making minimum payments on all debts, and putting any extra money toward the smallest debt first. When the smallest debt is paid off, its minimum payment "rolls" into the next smallest debt, creating a snowball effect. This method prioritizes psychological wins to keep you motivated.' },
    { question: 'What is the debt avalanche method?', answer: 'The debt avalanche method (also called debt stacking) focuses on paying off debts with the highest interest rates first, regardless of balance. While this approach saves more money in total interest, it may take longer to see your first debt fully paid off, which can be less motivating for some people.' },
    { question: 'Which is better — snowball or avalanche?', answer: 'Mathematically, the avalanche method always saves more in interest. However, behavioral research shows that the psychological boost from paying off small debts quickly (snowball) helps many people stay committed to their payoff plan. The best method is the one you\'ll stick with. Our calculator shows both so you can compare.' },
    { question: 'How much extra should I put toward debt?', answer: 'Any extra amount helps, but a common guideline is to use the 50/30/20 budget rule: 50% for needs, 30% for wants, and 20% for savings and debt repayment. If you\'re aggressively paying off debt, you might temporarily shift to 50/20/30 (allocating more to debt). Even an extra $100/month can save thousands in interest.' },
    { question: 'Should I pay off debt or invest?', answer: 'Generally, if your debt interest rate is higher than your expected investment return, prioritize debt payoff. For example, paying off a 20% credit card is equivalent to earning a guaranteed 20% return. However, always contribute enough to get any employer 401(k) match first (it\'s free money). For low-interest debt (under 5%), investing may be more beneficial long-term.' },
    { question: 'Should I have an emergency fund before starting?', answer: 'Yes. Most financial experts recommend saving a "starter" emergency fund of $1,000 to $2,000 before aggressively paying off debt. This ensures that a car repair or medical bill doesn’t force you back into high-interest credit card debt while you are in the middle of your payoff plan.' },
    { question: 'Does debt consolidation help?', answer: 'Debt consolidation — taking out one large loan to pay off multiple smaller ones — can help if the new loan has a significantly lower interest rate and if you stop using the credit cards you just paid off. Without a change in spending habits, consolidation often leads to even more debt.' },
    { question: 'What is "0% APR Balance Transfer"?', answer: 'This is a credit card offer that allows you to move your debt to a new card with 0% interest for a set period (usually 12-21 months). This is a powerful tool to pause interest and pay down principal, but be aware of "transfer fees" (usually 3-5%) and ensure you pay it off before the promotion ends.' },
    { question: 'How do extra payments impact the timeline?', answer: 'Because credit card interest is calculated daily or monthly based on your balance, paying even a small extra amount early in the month reduces the principal that interest is calculated on. This "compound interest in reverse" can shave years off your timeline.' },
    { question: 'What happens to my credit score as I pay off debt?', answer: 'As your "credit utilization ratio" (the amount of credit you are using vs. your total limit) decreases, your credit score typically increases. A utilization below 30% is considered good, and below 10% is excellent.' },
    { question: 'Does closing credit cards after paying them off help?', answer: 'Generally, no. Closing credit cards can hurt your credit score by reducing your total available credit (increasing your credit utilization ratio) and shortening your average account age. It\'s usually better to keep the cards open and use them occasionally for small purchases that you pay off immediately.' },
];

const defaultDebts = [
    { name: 'Credit Card', balance: 5000, rate: 22.99, minPayment: 150 },
    { name: 'Car Loan', balance: 15000, rate: 6.5, minPayment: 350 },
    { name: 'Student Loan', balance: 25000, rate: 5.0, minPayment: 280 },
];

export default function DebtSnowballCalculator() {
    const { formatCurrency } = useCurrency();
    const [debts, setDebts] = useState(defaultDebts);
    const [extraPayment, setExtraPayment] = useState(200);
    const [results, setResults] = useState(null);
    const [showMinPayments, setShowMinPayments] = useState(true);
    const [copied, setCopied] = useState(false);
    const resultsRef = useRef(null);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const loadExample = () => {
        setDebts([
            { name: 'Credit Card', balance: 8500, rate: 24.99, minPayment: 200 },
            { name: 'Personal Loan', balance: 12000, rate: 11.5, minPayment: 300 },
            { name: 'Car Loan', balance: 18000, rate: 5.9, minPayment: 400 },
            { name: 'Student Loan', balance: 35000, rate: 4.5, minPayment: 350 },
        ]);
        setExtraPayment(500);
        setResults(null);
    };

    const handleCalculate = (e) => {
        e.preventDefault();
        const validDebts = debts.filter(d => d.balance > 0 && d.minPayment > 0);
        const result = calculateDebtSnowball(validDebts, parseFloat(extraPayment));
        if (result.error) { alert(result.error); return; }
        setResults(result);
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    };

    const updateDebt = (index, field, value) => {
        const updated = [...debts];
        if (field === 'name') {
            updated[index] = { ...updated[index], name: value };
        } else {
            // Sanitize: only allow digits and dots
            const sanitized = String(value).replace(/[^0-9.]/g, '');
            const parts = sanitized.split('.');
            const clean = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : sanitized;
            updated[index] = { ...updated[index], [field]: parseFloat(clean) || 0 };
        }
        setDebts(updated);
    };

    const addDebt = () => {
        setDebts([...debts, { name: `Debt ${debts.length + 1}`, balance: 0, rate: 0, minPayment: 0 }]);
    };

    const removeDebt = (index) => {
        if (debts.length <= 1) return;
        setDebts(debts.filter((_, i) => i !== index));
    };

    const totalDebt = debts.reduce((s, d) => s + (d.balance || 0), 0);
    const totalMinPayments = debts.reduce((s, d) => s + (d.minPayment || 0), 0);

    const handleDownloadPDF = () => {
        if (!results) return;
        generatePDF('Debt Payoff Strategy', [
            { label: 'Total Debt', value: formatCurrency(totalDebt) },
            { label: 'Extra Monthly Payment', value: formatCurrency(extraPayment) },
            { label: 'Snowball Payoff Time', value: formatMonthsToYears(results.snowball.totalMonths) },
            { label: 'Snowball Interest', value: formatCurrency(results.snowball.totalInterest) },
            { label: 'Avalanche Payoff Time', value: formatMonthsToYears(results.avalanche.totalMonths) },
            { label: 'Avalanche Interest', value: formatCurrency(results.avalanche.totalInterest) },
            { label: 'Interest Saved (Snowball)', value: formatCurrency(results.interestSavedSnowball) },
            { label: 'Interest Saved (Avalanche)', value: formatCurrency(results.interestSavedAvalanche) },
        ], null, null);
    };

    const chartData = results ? {
        labels: results.snowball.timeline.map(t => `Month ${t.month}`),
        datasets: [
            {
                label: 'Snowball Method',
                data: results.snowball.timeline.map(t => t.totalBalance),
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.05)',
                fill: false, tension: 0.3, pointRadius: 4,
            },
            {
                label: 'Avalanche Method',
                data: results.avalanche.timeline.map(t => t.totalBalance),
                borderColor: '#059669',
                backgroundColor: 'rgba(5, 150, 105, 0.05)',
                fill: false, tension: 0.3, pointRadius: 4,
            },
            ...(showMinPayments ? [{
                label: 'Minimum Payments Only',
                data: results.minimumOnly.timeline.map(t => t.totalBalance),
                borderColor: '#dc2626',
                backgroundColor: 'rgba(220, 38, 38, 0.05)',
                fill: false, tension: 0.3, pointRadius: 4, borderDash: [5, 5],
            }] : []),
        ],
    } : null;

    return (
        <div className="calculator-page">
            <SEOHead
                title="Debt Snowball Calculator — Optimize Your Debt Payoff Strategy"
                description="Compare snowball vs. avalanche debt payoff methods. See how much interest you can save, get an optimized payoff order, and become debt-free faster."
                canonical="/debt-snowball-calculator"
                faqSchema={faqs}
            />

            <nav className="breadcrumbs">
                <Link to="/">Home</Link><span>/</span><span>Debt Snowball Calculator</span>
            </nav>

            <section className="calculator-hero">
                <h1>Debt Snowball Calculator</h1>
                <p className="hero-subtitle">
                    Find the fastest, most cost-effective way to eliminate your debts. Compare snowball vs. avalanche strategies side by side.
                </p>
            </section>

            <form className="calculator-form" onSubmit={handleCalculate} id="debt-snowball-form">
                <div className="form-top-actions">
                    <button type="button" className="btn-load-example" onClick={loadExample}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14,2 14,8 20,8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                        Load Example
                    </button>
                </div>
                <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Enter Your Debts</h3>

                <div className="debt-inputs">
                    {/* Column headers */}
                    <div className="debt-row" style={{ marginBottom: '0.25rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</label>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Balance</label>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rate (%)</label>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Min. Payment</label>
                        <div></div>
                    </div>
                    {debts.map((debt, idx) => (
                        <div key={idx} className="debt-row">
                            <input type="text" className="form-input" value={debt.name} onChange={e => updateDebt(idx, 'name', e.target.value)} placeholder="Debt name" />
                            <input type="number" className="form-input" value={debt.balance} onChange={e => updateDebt(idx, 'balance', e.target.value)} min="0" step="100" />
                            <input type="number" className="form-input" value={debt.rate} onChange={e => updateDebt(idx, 'rate', e.target.value)} min="0" max="50" step="0.1" />
                            <input type="number" className="form-input" value={debt.minPayment} onChange={e => updateDebt(idx, 'minPayment', e.target.value)} min="0" step="10" />
                            <button type="button" className="btn-remove-debt" onClick={() => removeDebt(idx)} aria-label="Remove debt" disabled={debts.length <= 1}>✕</button>
                        </div>
                    ))}
                </div>
                <button type="button" className="btn-add-debt" onClick={addDebt}>+ Add Another Debt</button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Debt</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(totalDebt)}</div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="extraPayment" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Extra Monthly Payment</label>
                        <input id="extraPayment" type="text" inputMode="decimal" className="form-input" value={extraPayment} onChange={e => { const v = e.target.value.replace(/[^0-9.]/g, ''); setExtraPayment(v); }} min="0" step="50" />
                    </div>
                </div>

                <button type="submit" className="btn-calculate" id="calculate-debt-snowball" style={{ marginTop: '1.25rem' }}>
                    Calculate Debt Payoff Strategy
                </button>
                <PrivacyBadge />
            </form>

            {results && (
                <div className="results-section" ref={resultsRef}>
                    {/* Strategy Comparison */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        <div className="result-card" style={{ borderTop: '3px solid #2563eb' }}>
                            <div className="result-label">❄️ Snowball</div>
                            <div className="result-value small">{formatMonthsToYears(results.snowball.totalMonths)}</div>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Interest: {formatCurrency(results.snowball.totalInterest)}</div>
                            <div style={{ fontSize: '0.8125rem', color: '#10b981', fontWeight: 600 }}>Saves {formatCurrency(results.interestSavedSnowball)}</div>
                        </div>
                        <div className="result-card" style={{ borderTop: '3px solid #10b981' }}>
                            <div className="result-label">🏔️ Avalanche</div>
                            <div className="result-value small">{formatMonthsToYears(results.avalanche.totalMonths)}</div>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Interest: {formatCurrency(results.avalanche.totalInterest)}</div>
                            <div style={{ fontSize: '0.8125rem', color: '#10b981', fontWeight: 600 }}>Saves {formatCurrency(results.interestSavedAvalanche)}</div>
                        </div>
                        <div className="result-card" style={{ borderTop: '3px solid #ef4444', background: 'rgba(239,68,68,0.06)' }}>
                            <div className="result-label">⚠️ Minimum Only</div>
                            <div className="result-value small">{formatMonthsToYears(results.minimumOnly.totalMonths)}</div>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Interest: {formatCurrency(results.minimumOnly.totalInterest)}</div>
                            <div style={{ fontSize: '0.8125rem', color: '#ef4444', fontWeight: 600 }}>Baseline</div>
                        </div>
                    </div>

                    <div className="chart-section">
                        <div className="chart-header">
                            <h3>Debt Payoff Timeline Comparison</h3>
                            <button
                                className={`chart-toggle ${showMinPayments ? 'active' : ''}`}
                                onClick={() => setShowMinPayments(!showMinPayments)}
                                type="button"
                            >
                                {showMinPayments ? 'Hide Min Payments' : 'Show Min Payments'}
                            </button>
                        </div>
                        <div className="chart-container">
                            <Line data={chartData} options={{
                                responsive: true, maintainAspectRatio: false,
                                plugins: { legend: { position: 'top', labels: { color: '#94a3b8', padding: 16, usePointStyle: true } }, tooltip: { backgroundColor: 'rgba(15,22,41,0.95)', titleColor: '#f1f5f9', bodyColor: '#94a3b8', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, padding: 12, cornerRadius: 8, callbacks: { label: ctx => `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}` } } },
                                scales: { y: { ticks: { callback: v => formatCurrency(v), color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' }, border: { color: 'transparent' } }, x: { grid: { display: false }, ticks: { color: '#64748b' }, border: { color: 'transparent' } } },
                            }} />
                        </div>
                    </div>



                    {/* Payoff Order */}
                    <div className="data-table-wrapper">
                        <div className="data-table-header"><h3>Recommended Payoff Order</h3></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
                            <div style={{ padding: '1rem 1.5rem', borderRight: '1px solid var(--border-primary)' }}>
                                <h4 style={{ fontSize: '0.875rem', color: '#3b82f6', marginBottom: '0.75rem' }}>❄️ Snowball Order (Smallest Balance First)</h4>
                                <ol style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    {results.snowball.payoffOrder.map((name, i) => (
                                        <li key={i} style={{ marginBottom: '0.375rem' }}>{name}</li>
                                    ))}
                                </ol>
                            </div>
                            <div style={{ padding: '1rem 1.5rem' }}>
                                <h4 style={{ fontSize: '0.875rem', color: '#10b981', marginBottom: '0.75rem' }}>🏔️ Avalanche Order (Highest Rate First)</h4>
                                <ol style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    {results.avalanche.payoffOrder.map((name, i) => (
                                        <li key={i} style={{ marginBottom: '0.375rem' }}>{name}</li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    </div>

                    <div className="actions-bar">
                        <button className="btn-action" onClick={handleDownloadPDF} type="button">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7,10 12,15 17,10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                            Download PDF
                        </button>
                        <ShareButton title="Debt Payoff Plan" text={`I can be debt-free in ${formatMonthsToYears(results.snowball.totalMonths)} and save ${formatCurrency(results.interestSavedSnowball)} in interest!`} />
                        <button className="btn-action" onClick={handleCopyLink} type="button">
                            {copied ? (
                                <><svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg> Copied!</>
                            ) : (
                                <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg> Copy Link</>
                            )}
                        </button>
                    </div>
                </div>
            )}

            <InternalLinks currentPath="/debt-snowball-calculator" />

            <section className="seo-content" id="seo">
                <h2>The Comprehensive Guide to Becoming Debt-Free</h2>
                <p>Living with debt can feel like swimming against a powerful current. No matter how hard you work, it seems like you're barely making progress. However, with a clear strategy and a visual roadmap, you can regain control of your financial future. Our Debt Snowball Calculator is designed to compare the world's most effective debt-payoff strategies, showing you exactly when you'll cross the finish line.</p>

                <h3>Understanding the "Minimum Payment Trap"</h3>
                <p>Banks and credit card companies design minimum payments to keep you in debt for as long as possible. Typically, a minimum payment is calculated as only 1% to 2% of your total balance plus any interest accrued that month. This means that if you only pay the minimum, you are barely touching the principal balance. On a $10,000 credit card with a 20% interest rate, making only minimum payments could take over 20 years to pay off and cost you more in interest than the original $10,000 you spent. Our calculator highlights the "Minimum Only" baseline to show you just how much time and money you save by adding even a small amount extra each month.</p>

                <h3>Motivation vs. Mathematics: Snowball vs. Avalanche</h3>
                <p>The two most popular payoff methods optimize for different things:</p>
                <ul>
                    <li><strong>The Debt Snowball (Psychological Optimization):</strong> Popularized by Dave Ramsey, this method focuses on behavioral psychology. You list your debts from smallest balance to largest. By knocking out the small ones first, you get a hit of dopamine and a "quick win" that keeps you motivated to tackle the bigger monsters. Research from Harvard Business Review suggests that "small wins" are the most significant predictor of successfully completing a debt-free journey.</li>
                    <li><strong>The Debt Avalanche (Mathematical Optimization):</strong> This method orders debts by interest rate (highest to lowest). By attacking the most expensive debt first, you minimize the total interest paid and technically become debt-free faster. If you are highly disciplined and unemotional about math, the Avalanche is your best friend.</li>
                </ul>

                <h3>How Extra Payments Create a Compounding "Snowball"</h3>
                <p>The magic of these methods isn't just the order — it's the <strong>rollover effect</strong>. When Debt #1 is paid off, its monthly payment doesn't go back into your pocket; it gets "rolled over" and added to the payment for Debt #2. As you pay off more debts, your monthly "power payment" grows larger and larger, exactly like a snowball rolling down a hill. By the time you reach your final, largest debt (like a student loan or a mortgage), you might be throwing thousands of dollars a month at it, crushing it in record time.</p>

                <h3>The Impact of Debt on Your Credit Score</h3>
                <p>Your "Debt-to-Income" (DTI) ratio and "Credit Utilization" are the two biggest factors in your credit score. As you use our calculator to pay down balances, you'll likely see your credit score increase. Carrying high credit card balances (over 30% utilization) signals to lenders that you may be overextended. Paying these down not only saves you interest but also unlocks lower interest rates for future needs like home buying or business loans.</p>

                <h3>When to Consider Debt Consolidation or Settlement</h3>
                <p>If your total debt (excluding mortgage) exceeds 50% of your annual income, or if you are struggling to make even minimum payments, you might need to look beyond the snowball method:</p>
                <ul>
                    <li><strong>Debt Consolidation:</strong> Taking out a single personal loan at a lower interest rate to pay off all your high-interest cards. This simplifies your life but only works if you stop using the credit cards.</li>
                    <li><strong>Balance Transfer Cards:</strong> Many cards offer 0% APR for 12-21 months. This can be a powerful tool to pause interest while you aggressively pay down principal using the Avalanche method.</li>
                    <li><strong>Debt Settlement/Bankruptcy:</strong> These are "last resort" options that provide relief but severely damage your credit for years. Consult with a non-profit credit counseling agency before taking these steps.</li>
                </ul>

                <h3>Life After Debt: Building a Legacy</h3>
                <ol>
                    <li><strong>Build a "Starter" Emergency Fund:</strong> Before starting your snowball, save $1,000 to $2,000. This ensures that a flat tire or a broken appliance doesn't force you back into debt.</li>
                    <li><strong>The Full Emergency Fund:</strong> Once the debt is gone, redirect that massive "power payment" into a high-yield savings account until you have 3-6 months of expenses.</li>
                    <li><strong>Wealth Building:</strong> The habits you built while paying off debt — discipline, tracking, and intentionality — are the exact same habits needed to become a millionaire. Once you are debt-free, you are finally working for yourself, not for the bank.</li>
                </ol>
            </section>

            <FAQSection faqs={faqs} />

            <TryNextCalculator currentPath="/debt-snowball-calculator" />
        </div>
    );
}
