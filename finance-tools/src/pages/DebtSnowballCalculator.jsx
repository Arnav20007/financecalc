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
import { calculateDebtSnowball } from '../utils/calculations';
import { formatCurrency, formatMonthsToYears } from '../utils/formatters';
import { generatePDF } from '../utils/pdfGenerator';
import PrivacyBadge from '../components/common/PrivacyBadge';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const faqs = [
    { question: 'What is the debt snowball method?', answer: 'The debt snowball method involves listing your debts from smallest to largest balance, making minimum payments on all debts, and putting any extra money toward the smallest debt first. When the smallest debt is paid off, its minimum payment "rolls" into the next smallest debt, creating a snowball effect. This method prioritizes psychological wins to keep you motivated.' },
    { question: 'What is the debt avalanche method?', answer: 'The debt avalanche method (also called debt stacking) focuses on paying off debts with the highest interest rates first, regardless of balance. While this approach saves more money in total interest, it may take longer to see your first debt fully paid off, which can be less motivating for some people.' },
    { question: 'Which is better — snowball or avalanche?', answer: 'Mathematically, the avalanche method always saves more in interest. However, behavioral research shows that the psychological boost from paying off small debts quickly (snowball) helps many people stay committed to their payoff plan. The best method is the one you\'ll stick with. Our calculator shows both so you can compare.' },
    { question: 'How much extra should I put toward debt?', answer: 'Any extra amount helps, but a common guideline is to use the 50/30/20 budget rule: 50% for needs, 30% for wants, and 20% for savings and debt repayment. If you\'re aggressively paying off debt, you might temporarily shift to 50/20/30 (allocating more to debt). Even an extra $100/month can save thousands in interest.' },
    { question: 'Should I pay off debt or invest?', answer: 'Generally, if your debt interest rate is higher than your expected investment return, prioritize debt payoff. For example, paying off a 20% credit card is equivalent to earning a guaranteed 20% return. However, always contribute enough to get any employer 401(k) match first (it\'s free money). For low-interest debt (under 5%), investing may be more beneficial long-term.' },
    { question: 'Does closing credit cards after paying them off help?', answer: 'Generally, no. Closing credit cards can hurt your credit score by reducing your total available credit (increasing your credit utilization ratio) and shortening your average account age. It\'s usually better to keep the cards open and use them occasionally for small purchases that you pay off immediately.' },
];

const defaultDebts = [
    { name: 'Credit Card', balance: 5000, rate: 22.99, minPayment: 150 },
    { name: 'Car Loan', balance: 15000, rate: 6.5, minPayment: 350 },
    { name: 'Student Loan', balance: 25000, rate: 5.0, minPayment: 280 },
];

export default function DebtSnowballCalculator() {
    const [debts, setDebts] = useState(defaultDebts);
    const [extraPayment, setExtraPayment] = useState(200);
    const [results, setResults] = useState(null);
    const resultsRef = useRef(null);

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
            {
                label: 'Minimum Payments Only',
                data: results.minimumOnly.timeline.map(t => t.totalBalance),
                borderColor: '#dc2626',
                backgroundColor: 'rgba(220, 38, 38, 0.05)',
                fill: false, tension: 0.3, pointRadius: 4, borderDash: [5, 5],
            },
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
                        <h3>Debt Payoff Timeline Comparison</h3>
                        <div className="chart-container">
                            <Line data={chartData} options={{
                                responsive: true, maintainAspectRatio: false,
                                plugins: { legend: { position: 'top', labels: { color: '#94a3b8', padding: 16, usePointStyle: true } }, tooltip: { backgroundColor: 'rgba(15,22,41,0.95)', titleColor: '#f1f5f9', bodyColor: '#94a3b8', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, padding: 12, cornerRadius: 8, callbacks: { label: ctx => `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}` } } },
                                scales: { y: { ticks: { callback: v => formatCurrency(v), color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' }, border: { color: 'transparent' } }, x: { grid: { display: false }, ticks: { color: '#64748b' }, border: { color: 'transparent' } } },
                            }} />
                        </div>
                    </div>

                    <AdSlot type="mid-content" />

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
                    </div>
                </div>
            )}

            <InternalLinks currentPath="/debt-snowball-calculator" />

            <section className="seo-content">
                <h2>Understanding Debt Payoff Strategies</h2>
                <p>
                    When you have multiple debts, choosing the right payoff strategy can save you thousands of dollars in interest and get you to financial freedom years sooner. The two most popular approaches are the debt snowball and debt avalanche methods. Both are effective, but they optimize for different things — motivation vs. mathematics.
                </p>
                <p>
                    Our calculator compares both methods side by side, showing you exactly how much time and money each approach saves compared to making only minimum payments. This transparency empowers you to choose the strategy that best fits your financial personality and goals.
                </p>

                <h2>The Debt Snowball Method Explained</h2>
                <p>
                    Popularized by Dave Ramsey, the debt snowball method focuses on behavioral psychology rather than pure mathematics. Here's how it works: list all your debts from smallest balance to largest. Make minimum payments on everything, then throw every extra dollar at the smallest debt. When that's paid off, take its full payment amount and add it to the next smallest debt's minimum payment.
                </p>
                <p>
                    The power of the snowball method lies in the quick wins it provides. Paying off a small debt completely — even a $500 credit card — creates a psychological boost that motivates you to keep going. Research by Harvard Business Review found that people who focus on small wins are more likely to stick with their debt repayment plans.
                </p>

                <h2>The Debt Avalanche Method Explained</h2>
                <p>
                    The debt avalanche method is the mathematically optimal approach. Instead of focusing on balance size, you order your debts by interest rate, from highest to lowest. You make minimum payments on all debts and put extra money toward the highest-rate debt first.
                </p>
                <p>
                    This method minimizes the total interest you pay over the life of your debt repayment. For people with high-interest credit card debt alongside lower-rate student loans or car payments, the avalanche method can save significant money. However, if your highest-rate debt also has the largest balance, it may take months before you get the satisfaction of paying anything off completely.
                </p>

                <h2>How Extra Payments Accelerate Payoff</h2>
                <p>
                    The impact of extra payments on debt elimination is dramatic. Consider someone with $45,000 in total debt across multiple accounts. Making only minimum payments might take 15+ years and cost $30,000+ in interest. Adding just $200/month in extra payments can cut the timeline to 4-5 years and save $20,000+ in interest.
                </p>
                <p>
                    Finding extra money for debt payoff doesn't always require a higher income. Common strategies include: reducing discretionary spending, selling unused items, picking up a side gig, redirecting savings from paid-off debts (the snowball effect), and using windfalls like tax refunds strategically.
                </p>

                <h2>When to Consider Debt Consolidation</h2>
                <p>
                    If you're juggling multiple high-interest debts, consolidation might simplify your payments and potentially lower your overall interest rate. Balance transfer credit cards (often with 0% introductory APR), personal loans, and home equity loans are common consolidation tools.
                </p>
                <p>
                    However, consolidation only makes sense if the new interest rate is meaningfully lower than your current average rate and if you're committed to not accumulating new debt. Many people consolidate only to run up their credit cards again, ending up in a worse position than before. Use our calculator to compare consolidation scenarios against your current payoff plan.
                </p>

                <h2>Building Financial Habits After Debt</h2>
                <ul>
                    <li><strong>Emergency fund first:</strong> Build 3-6 months of expenses in savings to avoid future debt from unexpected costs.</li>
                    <li><strong>Redirect payments to savings:</strong> Once debt-free, invest the same amount you were paying toward debt into retirement savings or investments.</li>
                    <li><strong>Use credit wisely:</strong> Keep credit cards for convenience and rewards, but pay the full balance monthly. Never carry a balance if you can help it.</li>
                    <li><strong>Budget consistently:</strong> The habits that helped you pay off debt — budgeting, tracking expenses, being intentional — will serve you well in building wealth.</li>
                </ul>
            </section>

            <FAQSection faqs={faqs} />
            <AdSlot type="multiplex" />
            <TryNextCalculator currentPath="/debt-snowball-calculator" />
        </div>
    );
}
