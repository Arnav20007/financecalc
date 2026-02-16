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
import { calculateRetirement } from '../utils/calculations';
import { generatePDF } from '../utils/pdfGenerator';
import { useValidatedInputs } from '../utils/useValidatedInput';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

const faqs = [
    { question: 'How much do I need to retire?', answer: 'A common guideline is to have 25 times your annual expenses saved by retirement (based on the 4% withdrawal rule). For example, if you need $50,000 annually, you would need a corpus of $1.25 million.' },
    { question: 'What is the 4% rule?', answer: 'The 4% rule suggests that you can withdraw 4% of your retirement portfolio in the first year, then adjust that amount for inflation each subsequent year, and your money should last at least 30 years.' },
    { question: 'When should I start saving for retirement?', answer: 'The best time to start saving for retirement is as early as possible. Thanks to compound interest, money invested in your 20s has significantly more time to grow than money invested in your 40s.' },
    { question: 'What rate of return should I assume?', answer: 'For a diversified portfolio of stocks and bonds, a reasonable long-term assumption is 6-8% annually before inflation. If you want to see "today’s dollars," use a "real" rate of 4-5% (nominal rate minus inflation).' },
    { question: 'How does Social Security factor in?', answer: 'Social Security benefits provide a safety net but typically only replace about 40% of pre-retirement income. Our calculator focuses on your personal savings to bridge the gap and ensure a comfortable lifestyle.' },
    { question: 'Should I use a Roth IRA or Traditional IRA?', answer: 'Traditional IRAs provide a tax break today (contributions are deductible), while Roth IRAs provide tax-free income tomorrow. If you think you will be in a higher tax bracket in retirement, a Roth is generally superior.' },
    { question: 'What is "Coast FIRE"?', answer: 'Coast FIRE is the point where you have already saved enough in your retirement accounts that, even if you never contribute another cent, the balance will grow to your target retirement number by the time you reach retirement age because of compounding.' },
    { question: 'How do healthcare costs impact retirement?', answer: 'Healthcare is one of the largest expenses in retirement. Fidelity estimates that an average 65-year-old couple may need $315,000 to cover healthcare costs in retirement, excluding long-term care. It’s wise to have a dedicated Health Savings Account (HSA) for this.' },
    { question: 'What is a "Catch-up Contribution"?', answer: 'If you are age 50 or older, the IRS allows you to contribute extra money beyond the standard limits to your 401(k) and IRA. This is designed to help those who started late "catch up" on their savings goals.' },
    { question: 'Does this calculator account for inflation?', answer: 'Our calculator uses nominal values. To see your results in "inflation-adjusted" terms, subtract the expected inflation rate (usually 2-3%) from your expected investment return before inputting it.' },
    { question: 'Can I retire early if I reach my number before age 65?', answer: 'Yes! Reaching your "FI Number" (Financial Independence) means your assets generate enough income to cover your expenses. However, be aware of early withdrawal penalties (usually before age 59½) and plan your "bridge" strategy accordingly.' },
];

const validationRules = {
    currentAge: { label: 'Current Age', min: 18, max: 80, allowDecimal: false, required: true },
    retirementAge: { label: 'Retirement Age', min: 30, max: 100, allowDecimal: false, required: true },
    currentSavings: { label: 'Current Savings', min: 0, max: 100000000, required: true },
    monthlyContribution: { label: 'Monthly Contribution', min: 0, max: 1000000, required: true },
    expectedReturn: { label: 'Expected Return', min: 0, max: 30, allowDecimal: true, required: true },
    withdrawalRate: { label: 'Withdrawal Rate', min: 1, max: 10, allowDecimal: true, required: true },
};

export default function RetirementCalculator() {
    const { formatCurrency, symbol } = useCurrency();
    const { values: inputs, errors, touched, handleChange, handleBlur, validateAll, getNumericValue, setValues } = useValidatedInputs(
        { currentAge: '30', retirementAge: '65', currentSavings: '50000', monthlyContribution: '1000', expectedReturn: '7', withdrawalRate: '4' },
        validationRules
    );
    const [results, setResults] = useState(null);
    const [calcError, setCalcError] = useState('');
    const [compareMode, setCompareMode] = useState(false);
    const [compareContribution, setCompareContribution] = useState('2000');
    const [compareResults, setCompareResults] = useState(null);
    const [copied, setCopied] = useState(false);
    const resultsRef = useRef(null);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const loadExample = () => {
        setValues({ currentAge: '28', retirementAge: '60', currentSavings: '75000', monthlyContribution: '1500', expectedReturn: '8', withdrawalRate: '4' });
        setResults(null); setCalcError('');
    };

    const handleCalculate = (e) => {
        e.preventDefault();
        setCalcError('');
        if (!validateAll()) return;
        const result = calculateRetirement(
            parseInt(inputs.currentAge), parseInt(inputs.retirementAge),
            getNumericValue('currentSavings'), getNumericValue('monthlyContribution'),
            getNumericValue('expectedReturn'), getNumericValue('withdrawalRate')
        );
        if (result.error) { setCalcError(result.error); setResults(null); return; }
        setResults(result);
        if (compareMode) {
            const cResult = calculateRetirement(
                parseInt(inputs.currentAge), parseInt(inputs.retirementAge),
                getNumericValue('currentSavings'), parseFloat(compareContribution) || 0,
                getNumericValue('expectedReturn'), getNumericValue('withdrawalRate')
            );
            setCompareResults(cResult.error ? null : cResult);
        }
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    };

    const handleDownloadPDF = () => {
        if (!results) return;
        generatePDF('Retirement Projection', [
            { label: 'Retirement Corpus', value: formatCurrency(results.retirementCorpus) },
            { label: 'Total Contributions', value: formatCurrency(results.totalContributions) },
            { label: 'Investment Growth', value: formatCurrency(results.totalGrowth) },
            { label: 'Annual Withdrawal', value: formatCurrency(results.annualWithdrawal) },
            { label: 'Monthly Withdrawal', value: formatCurrency(results.monthlyWithdrawal) },
        ], results.projection, [
            { header: 'Age', accessor: r => r.age },
            { header: 'Balance', accessor: r => formatCurrency(r.balance) },
            { header: 'Contributions', accessor: r => formatCurrency(r.totalContributions) },
            { header: 'Growth', accessor: r => formatCurrency(r.yearlyGrowth) },
        ]);
    };

    const chartOpts = {
        responsive: true, maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top', labels: { color: '#94a3b8', padding: 16, usePointStyle: true } },
            tooltip: { backgroundColor: 'rgba(15,22,41,0.95)', titleColor: '#f1f5f9', bodyColor: '#94a3b8', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, padding: 12, cornerRadius: 8, callbacks: { label: ctx => `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}` } },
        },
        scales: {
            y: { ticks: { callback: v => formatCurrency(v), color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' }, border: { color: 'transparent' } },
            x: { grid: { display: false }, ticks: { color: '#64748b' }, border: { color: 'transparent' } },
        },
    };

    const lineChartData = results ? {
        labels: results.projection.map(r => `Age ${r.age}`),
        datasets: [
            { label: 'Portfolio Value', data: results.projection.map(r => r.balance), borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.08)', fill: true, tension: 0.4, pointRadius: 2, pointBackgroundColor: '#10b981' },
            { label: 'Total Contributions', data: results.projection.map(r => r.totalContributions), borderColor: '#64748b', backgroundColor: 'rgba(100,116,139,0.05)', fill: true, tension: 0.4, pointRadius: 2, borderDash: [5, 5] },
            ...(compareMode && compareResults ? [{
                label: `Scenario B (${symbol}${compareContribution}/mo)`,
                data: compareResults.projection.map(r => r.balance),
                borderColor: '#8b5cf6', backgroundColor: 'rgba(139, 92, 246, 0.05)',
                fill: false, tension: 0.4, pointRadius: 2, borderDash: [8, 4],
                pointBackgroundColor: '#8b5cf6',
            }] : []),
        ],
    } : null;

    const doughnutData = results ? {
        labels: ['Contributions', 'Investment Growth'],
        datasets: [{ data: [results.totalContributions, results.totalGrowth], backgroundColor: ['rgba(100,116,139,0.3)', 'rgba(16,185,129,0.6)'], borderColor: ['rgba(100,116,139,0.5)', 'rgba(16,185,129,0.9)'], borderWidth: 2 }],
    } : null;

    return (
        <div className="calculator-page">
            <SEOHead title="Retirement Calculator — Free Retirement Savings Projection" description="Calculate how much you need to retire comfortably." canonical="/retirement-calculator" faqSchema={faqs} />
            <nav className="breadcrumbs"><Link to="/">Home</Link><span>/</span><span>Retirement Calculator</span></nav>
            <section className="calculator-hero"><h1>Retirement Calculator</h1><p className="hero-subtitle">Project your retirement nest egg and estimate your future monthly income. Start planning your financial independence today.</p></section>

            <form className="calculator-form" onSubmit={handleCalculate} id="retirement-form" noValidate>
                <div className="form-top-actions">
                    <button type="button" className="btn-load-example" onClick={loadExample}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14,2 14,8 20,8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                        Load Example
                    </button>
                </div>
                <div className="form-grid">
                    <ValidatedInput name="currentAge" label="Current Age" value={inputs.currentAge} onChange={handleChange} onBlur={handleBlur} error={errors.currentAge} touched={touched.currentAge} suffix="yrs" min={18} max={80} />
                    <ValidatedInput name="retirementAge" label="Retirement Age" value={inputs.retirementAge} onChange={handleChange} onBlur={handleBlur} error={errors.retirementAge} touched={touched.retirementAge} suffix="yrs" min={30} max={100} />
                    <ValidatedInput name="currentSavings" label="Current Savings" value={inputs.currentSavings} onChange={handleChange} onBlur={handleBlur} error={errors.currentSavings} touched={touched.currentSavings} prefix={symbol} min={0} step={1000} />
                    <ValidatedInput name="monthlyContribution" label="Monthly Contribution" value={inputs.monthlyContribution} onChange={handleChange} onBlur={handleBlur} error={errors.monthlyContribution} touched={touched.monthlyContribution} prefix={symbol} min={0} step={50} />
                    <ValidatedInput name="expectedReturn" label="Expected Annual Return" hint="(%)" value={inputs.expectedReturn} onChange={handleChange} onBlur={handleBlur} error={errors.expectedReturn} touched={touched.expectedReturn} suffix="%" min={0} max={30} step={0.1} />
                    <ValidatedInput name="withdrawalRate" label="Safe Withdrawal Rate" hint="(%)" value={inputs.withdrawalRate} onChange={handleChange} onBlur={handleBlur} error={errors.withdrawalRate} touched={touched.withdrawalRate} suffix="%" min={1} max={10} step={0.1} />
                </div>
                {compareMode && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 'var(--radius-md)' }}>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#8b5cf6', marginBottom: '0.5rem', display: 'block' }}>Scenario B — Monthly Contribution ({symbol})</label>
                        <input type="number" className="form-input" value={compareContribution} onChange={e => setCompareContribution(e.target.value)} min="0" step="100" />
                    </div>
                )}
                {calcError && <p style={{ color: 'var(--color-error)', marginTop: '0.75rem', fontSize: '0.875rem', padding: '0.75rem', background: 'rgba(239,68,68,0.08)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>{calcError}</p>}
                <button type="submit" className="btn-calculate" style={{ marginTop: '1.25rem' }}>Calculate Retirement Projection</button>
                <PrivacyBadge />
            </form>

            {results && (
                <div className="results-section" ref={resultsRef}>
                    <div className="results-summary">
                        <div className="result-card highlight"><div className="result-label">Retirement Corpus</div><div className="result-value">{formatCurrency(results.retirementCorpus)}</div></div>
                        <div className="result-card success"><div className="result-label">Monthly Withdrawal</div><div className="result-value small" style={{ color: '#10b981' }}>{formatCurrency(results.monthlyWithdrawal)}</div></div>
                        <div className="result-card"><div className="result-label">Annual Withdrawal</div><div className="result-value small">{formatCurrency(results.annualWithdrawal)}</div></div>
                        <div className="result-card"><div className="result-label">Investment Growth</div><div className="result-value small" style={{ color: '#10b981' }}>{formatCurrency(results.totalGrowth)}</div></div>
                    </div>

                    <div className="chart-section"><h3>Portfolio Growth Projection</h3><div className="chart-container"><Line data={lineChartData} options={chartOpts} /></div></div>
                    <div className="chart-section"><h3>Contributions vs Growth</h3><div style={{ maxWidth: 300, margin: '0 auto' }}><Doughnut data={doughnutData} options={{ responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } }, tooltip: { backgroundColor: 'rgba(15,22,41,0.95)', bodyColor: '#94a3b8', callbacks: { label: ctx => `${ctx.label}: ${formatCurrency(ctx.raw)}` } } } }} /></div></div>



                    <div className="data-table-wrapper">
                        <div className="data-table-header"><h3>Year-by-Year Projection</h3></div>
                        <div className="data-table-scroll">
                            <table className="data-table">
                                <thead><tr><th>Age</th><th>Portfolio Value</th><th>Contributions</th><th>Yearly Growth</th></tr></thead>
                                <tbody>{results.projection.map(row => (
                                    <tr key={row.year}><td>{row.age}</td><td><strong>{formatCurrency(row.balance)}</strong></td><td>{formatCurrency(row.totalContributions)}</td><td style={{ color: '#10b981' }}>+{formatCurrency(row.yearlyGrowth)}</td></tr>
                                ))}</tbody>
                            </table>
                        </div>
                    </div>

                    <div className="actions-bar">
                        <button className="btn-action" onClick={handleDownloadPDF} type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7,10 12,15 17,10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>Download PDF</button>
                        <ShareButton title="Retirement Projection" text={`By age ${inputs.retirementAge}, I could have ${formatCurrency(results.retirementCorpus)} for retirement!`} />
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
                                <h4>Scenario A ({symbol}{inputs.monthlyContribution}/mo)</h4>
                                <div className="result-label">Retirement Corpus</div>
                                <div className="result-value small">{formatCurrency(results.retirementCorpus)}</div>
                                <div className="result-label" style={{ marginTop: '0.5rem' }}>Monthly Withdrawal</div>
                                <div className="result-value small">{formatCurrency(results.monthlyWithdrawal)}</div>
                            </div>
                            <div className="compare-column scenario-b">
                                <h4>Scenario B ({symbol}{compareContribution}/mo)</h4>
                                <div className="result-label">Retirement Corpus</div>
                                <div className="result-value small">{formatCurrency(compareResults.retirementCorpus)}</div>
                                <div className="result-label" style={{ marginTop: '0.5rem' }}>Monthly Withdrawal</div>
                                <div className="result-value small">{formatCurrency(compareResults.monthlyWithdrawal)}</div>
                                <div className="result-label" style={{ marginTop: '0.5rem', color: '#10b981', fontWeight: 600 }}>Extra: +{formatCurrency(compareResults.retirementCorpus - results.retirementCorpus)}</div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <InternalLinks currentPath="/retirement-calculator" />
            <section className="seo-content" id="seo">
                <h2>The Ultimate Guide to Retirement Planning & Wealth Projection</h2>
                <p>Retirement planning is the cornerstone of long-term financial security. It's the process of determining your retirement income goals and the actions and decisions necessary to achieve those goals. While it might seem like a distant concern for many, the math of compounding shows that every year you wait to start significantly increases the monthly amount you'll need to save later in life. Our Retirement Calculator helps you visualize your future and bridge the gap between where you are today and where you want to be.</p>

                <h3>How Much Do You Really Need to Retire?</h3>
                <p>The "Number" — the total amount of money you need in your nest egg — is different for everyone. A common starting point is the <strong>25x Rule</strong>: to maintain your current lifestyle, you should aim to save 25 times your expected annual expenses. For example, if you plan to spend $60,000 per year in retirement, you would need a corpus of $1.5 million. Our calculator allows you to reverse-engineer this goal based on your current age, savings, and contribution levels.</p>

                <h3>Understanding the 4% Rule of Withdrawal</h3>
                <p>Once you reach retirement, the next big question is: <em>"How much can I safely withdraw without running out of money?"</em> The <strong>4% Rule</strong> is a widely recognized benchmark derived from the Trinity Study. It suggests that you can safely withdraw 4% of your total portfolio in the first year of retirement, and then adjust that amount for inflation every year thereafter, with a high probability that your money will last for at least 30 years.</p>
                <p>However, many modern advisors suggest a more conservative approach (3% to 3.5%) if you plan on an early retirement or if market conditions are volatile at the start of your retirement years.</p>

                <h3>The Power of Tax-Advantaged Accounts</h3>
                <p>Where you save is just as important as how much you save. Using the right "buckets" can save you hundreds of thousands of dollars in taxes over your career:</p>
                <ul>
                    <li><strong>401(k) / 403(b):</strong> These are employer-sponsored plans. The biggest advantage is the <strong>Employer Match</strong> — if your employer offers a match, it is effectively a 100% immediate return on your investment. Always contribute at least enough to get the full match.</li>
                    <li><strong>Traditional IRA:</strong> Contributions may be tax-deductible today, lowering your taxable income. You pay taxes later when you withdraw the money in retirement.</li>
                    <li><strong>Roth IRA:</strong> You contribute money after paying taxes now, but the money grows completely tax-free, and your withdrawals in retirement are also tax-free. This is incredibly powerful for young investors who expect to be in a higher tax bracket later in life.</li>
                </ul>

                <h3>Navigating Retirement Philosophies: FIRE, Coast FIRE, and Beyond</h3>
                <p>The traditional concept of retiring at 65 is changing. Many people are now aiming for <strong>F.I.R.E. (Financial Independence, Retire Early)</strong>. Here are a few popular variations:</p>
                <ul>
                    <li><strong>Lean FIRE:</strong> Living a minimalist lifestyle to retire early with a smaller corpus.</li>
                    <li><strong>Fat FIRE:</strong> Saving aggressively to enjoy a luxury lifestyle in retirement.</li>
                    <li><strong>Coast FIRE:</strong> Investing early and aggressively until your portfolio is large enough that it will grow to your target retirement number on its own through compounding, even if you never contribute another cent. This allows you to "coast" into retirement by just earning enough to cover your current living expenses.</li>
                </ul>

                <h3>Key Variables That Impact Your Result</h3>
                <p>In our Retirement Calculator, a few percentages can make a massive difference:</p>
                <ol>
                    <li><strong>Expected Rate of Return:</strong> Most long-term investors aim for 7% to 8% (the historical average of the stock market). Being too conservative might mean you have to work longer, while being too aggressive might expose you to too much risk.</li>
                    <li><strong>Inflation:</strong> Remember that $1 million in 30 years will not buy what $1 million buys today. Our calculator focuses on nominal values, so it's often wise to use a "real" rate of return (Nominal Return minus Inflation) for a more accurate projection.</li>
                    <li><strong>Current Savings:</strong> Your starting point acts as the seed. The larger the seed, the more work the compounding "engine" can do for you in the early years.</li>
                </ol>

                <h3>Practical Steps to Audit Your Retirement Plan</h3>
                <ol>
                    <li><strong>Review your monthly expenses:</strong> Tracking your spending today is the best way to estimate your spending tomorrow.</li>
                    <li><strong>Check your asset allocation:</strong> As you get closer to retirement, many people shift from high-growth stocks to more stable bonds to protect their corpus from market crashes.</li>
                    <li><strong>Use comparison modes:</strong> Use our calculator to see how adding just $200 more per month can potentially shorten your working life by years.</li>
                </ol>
            </section>
            <FAQSection faqs={faqs} />

            <TryNextCalculator currentPath="/retirement-calculator" />
        </div>
    );
}
