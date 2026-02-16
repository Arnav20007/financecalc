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
import { calculateCompoundInterest } from '../utils/calculations';
import { generatePDF } from '../utils/pdfGenerator';
import { useValidatedInputs } from '../utils/useValidatedInput';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

const faqs = [
    { question: 'What is compound interest?', answer: 'Compound interest is interest calculated on both the initial principal and the accumulated interest from previous periods. Unlike simple interest which only earns on the principal, compound interest creates a "snowball effect" where your earnings generate their own earnings, leading to exponential growth over time.' },
    { question: 'How often is interest compounded?', answer: 'Interest can be compounded at different frequencies: annually, semi-annually, quarterly, monthly, or daily. Our calculator uses monthly compounding, which is the most common for savings accounts and investments. More frequent compounding results in slightly higher returns.' },
    { question: 'What is the difference between simple and compound interest?', answer: 'Simple interest is calculated only on the original principal amount. Compound interest is calculated on the principal plus any previously earned interest. Over long periods, compound interest results in significantly higher returns. For example, $10,000 at 7% simple interest earns $700/year forever, but with compound interest, the earnings grow every year.' },
    { question: 'How do monthly contributions affect compound interest?', answer: 'Regular monthly contributions dramatically accelerate wealth building. Each contribution starts earning compound interest immediately, and the combined effect of consistent investing plus compounding creates a powerful wealth-building engine. Even small monthly amounts can grow to significant sums over decades.' },
    { question: 'What is the Rule of 72?', answer: 'The Rule of 72 is a quick way to estimate how long it takes for an investment to double. Simply divide 72 by the annual interest rate. For example, at 8% annual return, your money doubles in approximately 72/8 = 9 years. This is an approximation that works best for rates between 6% and 10%.' },
    { question: 'Does inflation affect compound interest earnings?', answer: 'Yes, while your money grows numerically, inflation reduces the "purchasing power" of those future dollars. To account for this, many financial planners suggest using a "real rate of return" (your expected interest rate minus inflation) to see what your future wealth will actually buy in today’s terms.' },
    { question: 'Are investment returns always constant as shown in charts?', answer: 'No. The stock market and other investments fluctuate. While our calculator shows a smooth growth curve based on a fixed rate, real-world returns go up and down. Compounding works best when you remain invested through these market cycles over the long term.' },
    { question: 'How do taxes impact my compounded growth?', answer: 'Taxes can significantly "leak" your compounded growth if not managed well. Investing in tax-advantaged accounts like Roth IRAs or 401(k)s allows your money to compound without being taxed annually, which can lead to a 20-30% larger final balance compared to a taxable account.' },
    { question: 'Can I over-contribute to my investments?', answer: 'Mathematically, more is almost always better for compounding. However, ensure you have an emergency fund first and that you are not exceeding legal contribution limits for specific accounts like IRAs or 401(k)s, as this can lead to tax penalties.' },
    { question: 'Are the results of this calculator guaranteed?', answer: 'No. This calculator provides estimates based on a constant rate of return. Real-world investment returns vary from year to year and are not guaranteed. The results are for educational and planning purposes only. Consult a qualified financial advisor for personalized investment advice.' },
];

const validationRules = {
    principal: { label: 'Initial Investment', min: 0, max: 100000000, required: true },
    monthly: { label: 'Monthly Contribution', min: 0, max: 1000000, required: true },
    rate: { label: 'Annual Interest Rate', min: 0, max: 50, allowDecimal: true, required: true },
    years: { label: 'Investment Period', min: 1, max: 100, allowDecimal: false, required: true },
};

export default function CompoundInterestCalculator() {
    const { formatCurrency, symbol } = useCurrency();
    const { values: inputs, errors, touched, handleChange, handleBlur, validateAll, getNumericValue, setValues } = useValidatedInputs(
        { principal: '10000', monthly: '500', rate: '7', years: '20' },
        validationRules
    );
    const [results, setResults] = useState(null);
    const [compareMode, setCompareMode] = useState(false);
    const [compareInputs, setCompareInputs] = useState({ principal: '10000', monthly: '500', rate: '10', years: '20' });
    const [compareResults, setCompareResults] = useState(null);
    const [copied, setCopied] = useState(false);
    const [showInterest, setShowInterest] = useState(true);
    const resultsRef = useRef(null);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const loadExample = () => {
        setValues({ principal: '25000', monthly: '750', rate: '8', years: '30' });
        setResults(null);
    };

    const handleCalculate = (e) => {
        e.preventDefault();
        if (!validateAll()) return;
        const result = calculateCompoundInterest(
            getNumericValue('principal'), getNumericValue('monthly'),
            getNumericValue('rate'), parseInt(inputs.years)
        );
        setResults(result);
        if (compareMode) {
            const cResult = calculateCompoundInterest(
                parseFloat(compareInputs.principal) || 0, parseFloat(compareInputs.monthly) || 0,
                parseFloat(compareInputs.rate) || 0, parseInt(compareInputs.years) || 1
            );
            setCompareResults(cResult);
        }
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    };

    const handleCompareChange = (e) => setCompareInputs({ ...compareInputs, [e.target.name]: e.target.value });

    const handleDownloadPDF = () => {
        if (!results) return;
        generatePDF('Compound Interest Results', [
            { label: 'Final Balance', value: formatCurrency(results.finalBalance) },
            { label: 'Total Contributions', value: formatCurrency(results.totalContributions) },
            { label: 'Total Interest Earned', value: formatCurrency(results.totalInterest) },
            { label: 'Initial Principal', value: formatCurrency(getNumericValue('principal')) },
            { label: 'Monthly Contribution', value: formatCurrency(getNumericValue('monthly')) },
            { label: 'Annual Rate', value: `${inputs.rate}%` },
            { label: 'Time Period', value: `${inputs.years} years` },
        ], results.breakdown, [
            { header: 'Year', accessor: r => r.year },
            { header: 'Balance', accessor: r => formatCurrency(r.balance) },
            { header: 'Contributions', accessor: r => formatCurrency(r.totalContributions) },
            { header: 'Interest Earned', accessor: r => formatCurrency(r.yearlyInterest) },
            { header: 'Total Interest', accessor: r => formatCurrency(r.totalInterest) },
        ]);
    };

    const lineChartData = results ? {
        labels: results.breakdown.map(r => `Year ${r.year}`),
        datasets: [
            {
                label: 'Total Balance',
                data: results.breakdown.map(r => r.balance),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.08)',
                fill: true, tension: 0.4, pointRadius: 3,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: 'rgba(10, 14, 26, 0.8)',
                pointBorderWidth: 2,
            },
            {
                label: 'Total Contributions',
                data: results.breakdown.map(r => r.totalContributions),
                borderColor: '#64748b',
                backgroundColor: 'rgba(100, 116, 139, 0.05)',
                fill: true, tension: 0.4, pointRadius: 3, borderDash: [5, 5],
                pointBackgroundColor: '#64748b',
                hidden: !showInterest, // Toggling interest-related data
            },
            ...(showInterest ? [{
                label: 'Yearly Interest',
                data: results.breakdown.map(r => r.yearlyInterest),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                fill: true, tension: 0.4, pointRadius: 0,
            }] : []),
            ...(compareMode && compareResults ? [{
                label: 'Scenario B Balance',
                data: compareResults.breakdown.map(r => r.balance),
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.05)',
                fill: false, tension: 0.4, pointRadius: 3, borderDash: [8, 4],
                pointBackgroundColor: '#8b5cf6',
            }] : []),
        ],
    } : null;

    const doughnutData = results ? {
        labels: ['Total Contributions', 'Interest Earned'],
        datasets: [{
            data: [results.totalContributions, results.totalInterest],
            backgroundColor: ['rgba(100, 116, 139, 0.3)', 'rgba(59, 130, 246, 0.7)'],
            borderColor: ['rgba(100, 116, 139, 0.5)', 'rgba(59, 130, 246, 0.9)'],
            borderWidth: 2,
            hoverBackgroundColor: ['rgba(100, 116, 139, 0.5)', 'rgba(59, 130, 246, 0.9)'],
        }],
    } : null;

    const chartOptions = {
        responsive: true, maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top', labels: { color: '#94a3b8', padding: 16, usePointStyle: true, pointStyleWidth: 10 } },
            tooltip: {
                backgroundColor: 'rgba(15, 22, 41, 0.95)',
                titleColor: '#f1f5f9',
                bodyColor: '#94a3b8',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                callbacks: { label: ctx => `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}` },
            },
        },
        scales: {
            y: { ticks: { callback: v => formatCurrency(v), color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' }, border: { color: 'transparent' } },
            x: { grid: { display: false }, ticks: { color: '#64748b' }, border: { color: 'transparent' } },
        },
    };

    return (
        <div className="calculator-page">
            <SEOHead
                title="Compound Interest Calculator — Free Investment Growth Tool"
                description="Calculate compound interest with monthly contributions. See annual breakdowns, total returns, and chart projections. Free, accurate, and instantly downloadable."
                canonical="/compound-interest-calculator"
                faqSchema={faqs}
            />

            <nav className="breadcrumbs">
                <Link to="/">Home</Link>
                <span>/</span>
                <span>Compound Interest Calculator</span>
            </nav>

            <section className="calculator-hero">
                <h1>Compound Interest Calculator</h1>
                <p className="hero-subtitle">
                    See how your money grows over time with the power of compounding. Enter your details below for an instant, detailed projection.
                </p>
            </section>

            <form className="calculator-form" onSubmit={handleCalculate} id="compound-interest-form" noValidate>
                <div className="form-top-actions">
                    <button type="button" className="btn-load-example" onClick={loadExample}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14,2 14,8 20,8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                        Load Example
                    </button>
                </div>
                <div className="form-grid">
                    <ValidatedInput
                        name="principal" label="Initial Investment"
                        value={inputs.principal} onChange={handleChange} onBlur={handleBlur}
                        error={errors.principal} touched={touched.principal}
                        prefix={symbol} min={0} step={100}
                    />
                    <ValidatedInput
                        name="monthly" label="Monthly Contribution"
                        value={inputs.monthly} onChange={handleChange} onBlur={handleBlur}
                        error={errors.monthly} touched={touched.monthly}
                        prefix={symbol} min={0} step={50}
                    />
                    <ValidatedInput
                        name="rate" label="Annual Interest Rate" hint="(%)"
                        value={inputs.rate} onChange={handleChange} onBlur={handleBlur}
                        error={errors.rate} touched={touched.rate}
                        suffix="%" min={0} max={50} step={0.1}
                    />
                    <ValidatedInput
                        name="years" label="Investment Period" hint="(years)"
                        value={inputs.years} onChange={handleChange} onBlur={handleBlur}
                        error={errors.years} touched={touched.years}
                        suffix="yrs" min={1} max={100}
                    />
                </div>

                {compareMode && (
                    <>
                        <h4 style={{ margin: '1.5rem 0 0.75rem', color: '#8b5cf6' }}>Scenario B (Compare)</h4>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Initial Investment (B)</label>
                                <input name="principal" type="number" className="form-input" value={compareInputs.principal} onChange={handleCompareChange} min="0" step="100" />
                            </div>
                            <div className="form-group">
                                <label>Monthly Contribution (B)</label>
                                <input name="monthly" type="number" className="form-input" value={compareInputs.monthly} onChange={handleCompareChange} min="0" step="50" />
                            </div>
                            <div className="form-group">
                                <label>Annual Rate (B)</label>
                                <input name="rate" type="number" className="form-input" value={compareInputs.rate} onChange={handleCompareChange} min="0" max="50" step="0.1" />
                            </div>
                            <div className="form-group">
                                <label>Period (B)</label>
                                <input name="years" type="number" className="form-input" value={compareInputs.years} onChange={handleCompareChange} min="1" max="100" />
                            </div>
                        </div>
                    </>
                )}

                <button type="submit" className="btn-calculate" id="calculate-compound-interest" style={{ marginTop: '1.25rem' }}>
                    Calculate Compound Interest
                </button>
                <PrivacyBadge />
            </form>

            {results && (
                <div className="results-section" ref={resultsRef}>
                    <div className="results-summary">
                        <div className="result-card highlight">
                            <div className="result-label">Final Balance</div>
                            <div className="result-value">{formatCurrency(results.finalBalance)}</div>
                        </div>
                        <div className="result-card">
                            <div className="result-label">Total Contributions</div>
                            <div className="result-value small">{formatCurrency(results.totalContributions)}</div>
                        </div>
                        <div className="result-card success">
                            <div className="result-label">Interest Earned</div>
                            <div className="result-value small" style={{ color: '#10b981' }}>{formatCurrency(results.totalInterest)}</div>
                        </div>
                    </div>

                    {compareMode && compareResults && (
                        <div className="compare-results">
                            <div className="compare-column scenario-a">
                                <h4>Scenario A</h4>
                                <div className="result-label">Final Balance</div>
                                <div className="result-value small">{formatCurrency(results.finalBalance)}</div>
                                <div className="result-label" style={{ marginTop: '0.75rem' }}>Interest Earned</div>
                                <div className="result-value small">{formatCurrency(results.totalInterest)}</div>
                            </div>
                            <div className="compare-column scenario-b">
                                <h4>Scenario B</h4>
                                <div className="result-label">Final Balance</div>
                                <div className="result-value small">{formatCurrency(compareResults.finalBalance)}</div>
                                <div className="result-label" style={{ marginTop: '0.75rem' }}>Interest Earned</div>
                                <div className="result-value small">{formatCurrency(compareResults.totalInterest)}</div>
                            </div>
                        </div>
                    )}

                    <div className="chart-section">
                        <div className="chart-header">
                            <h3>Growth Projection</h3>
                            <button
                                className={`chart-toggle ${showInterest ? 'active' : ''}`}
                                onClick={() => setShowInterest(!showInterest)}
                            >
                                {showInterest ? 'Hide Interest' : 'Show Interest'}
                            </button>
                        </div>
                        <div className="chart-container">
                            <Line data={lineChartData} options={chartOptions} />
                        </div>
                    </div>

                    <div className="chart-section">
                        <h3>Contributions vs Interest</h3>
                        <div style={{ maxWidth: 300, margin: '0 auto' }}>
                            <Doughnut data={doughnutData} options={{
                                responsive: true,
                                plugins: {
                                    legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 16 } },
                                    tooltip: {
                                        backgroundColor: 'rgba(15, 22, 41, 0.95)',
                                        titleColor: '#f1f5f9',
                                        bodyColor: '#94a3b8',
                                        borderColor: 'rgba(255,255,255,0.1)',
                                        borderWidth: 1,
                                        callbacks: { label: ctx => `${ctx.label}: ${formatCurrency(ctx.raw)}` },
                                    },
                                },
                            }} />
                        </div>
                    </div>



                    <div className="data-table-wrapper">
                        <div className="data-table-header"><h3>Year-by-Year Breakdown</h3></div>
                        <div className="data-table-scroll">
                            <table className="data-table">
                                <thead>
                                    <tr><th>Year</th><th>Balance</th><th>Total Contributions</th><th>Yearly Interest</th><th>Total Interest</th></tr>
                                </thead>
                                <tbody>
                                    {results.breakdown.map(row => (
                                        <tr key={row.year}>
                                            <td>{row.year}</td>
                                            <td><strong>{formatCurrency(row.balance)}</strong></td>
                                            <td>{formatCurrency(row.totalContributions)}</td>
                                            <td style={{ color: '#10b981' }}>+{formatCurrency(row.yearlyInterest)}</td>
                                            <td>{formatCurrency(row.totalInterest)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="actions-bar">
                        <button className="btn-action" onClick={handleDownloadPDF} type="button">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7,10 12,15 17,10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                            Download PDF
                        </button>
                        <ShareButton title="Compound Interest Results" text={`My investment of ${formatCurrency(getNumericValue('principal'))} could grow to ${formatCurrency(results.finalBalance)} in ${inputs.years} years!`} />
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
                </div>
            )}

            <InternalLinks currentPath="/compound-interest-calculator" />

            <section className="seo-content" id="seo">
                <h2>The Comprehensive Guide to Compound Interest</h2>
                <p>Compound interest is often referred to as the "eighth wonder of the world" by financial experts, and for good reason. Unlike simple interest, which is calculated only on the initial amount of money (the principal), compound interest is calculated on the principal and all of the accumulated interest from previous periods. This means you earn interest on your interest, creating a mathematical snowball effect that can lead to exponential wealth growth over time.</p>

                <h3>How the Compound Interest Formula Works</h3>
                <p>The standard formula for compound interest is: <strong>A = P(1 + r/n)^(nt)</strong></p>
                <ul>
                    <li><strong>A:</strong> The final amount of money you'll have.</li>
                    <li><strong>P:</strong> The principal investment (your starting amount).</li>
                    <li><strong>r:</strong> The annual interest rate (as a decimal).</li>
                    <li><strong>n:</strong> The number of times interest is compounded per year.</li>
                    <li><strong>t:</strong> The number of years the money is invested.</li>
                </ul>
                <p>Our calculator simplifies this complex math while also accounting for <strong>monthly contributions</strong>. When you add money regularly, you aren't just letting one lump sum grow; you're constantly feeding the engine, which significantly accelerates the compounding process.</p>

                <h3>The Golden Rule of Wealth: Start Early</h3>
                <p>Time is the most critical variable in the compounding equation. To understand why, consider two investors: <strong>Investor A</strong> starts at age 25 and invests $500 per month for 10 years, then stops entirely at age 35. <strong>Investor B</strong> waits until age 35 and then invests $500 per month every single month until age 65 (30 years). Even though Investor B contributed three times more money over a much longer period, Investor A will likely end up with more money at retirement because those early dollars had an extra decade to compound. This is known as "time in the market," and it's something you can never get back once it's gone.</p>

                <h3>Understanding the Rule of 72</h3>
                <p>If you want a quick mental shortcut to understand how compounding affects your money, use the <strong>Rule of 72</strong>. To find out approximately how many years it will take to double your investment, divide 72 by your expected annual interest rate. For example, if you expect an 8% return, your money will double every 9 years (72 ÷ 8 = 9). At a 12% return, it doubles every 6 years. This rule highlights why even a 1% or 2% difference in interest rates can lead to massive differences in final wealth over the long term.</p>

                <h3>Compound Frequency: Why It Matters</h3>
                <p>Interest can be compounded annually, quarterly, monthly, or even daily. The more frequently interest is calculated and added back to your balance, the faster your money grows. For example, a $10,000 investment at 10% interest for 10 years would yield:</p>
                <ul>
                    <li><strong>Annual Compounding:</strong> $25,937</li>
                    <li><strong>Quarterly Compounding:</strong> $26,850</li>
                    <li><strong>Monthly Compounding:</strong> $27,070</li>
                    <li><strong>Daily Compounding:</strong> $27,179</li>
                </ul>
                <p>Our calculator defaults to <strong>monthly compounding</strong>, as this is the industry standard for most savings accounts and investment vehicles.</p>

                <h3>Real Returns vs. Nominal Returns</h3>
                <p>When planning for the future, it's essential to distinguish between nominal returns (the raw number) and real returns (adjusted for inflation). If your investment grows by 8% but inflation is 3%, your "real" purchasing power has only increased by 5%. When using our calculator for long-term retirement planning, many wealth managers recommend using a conservative rate of 6% to 7% to account for future inflation and provide a more realistic picture of what that money will actually buy in 20 or 30 years.</p>

                <h3>Asset Classes and Historical Returns</h3>
                <p>Where you put your money determines your interest rate. Historically, different asset classes have provided broad ranges of returns:</p>
                <ul>
                    <li><strong>Savings Accounts & HYSA:</strong> 0.01% – 5.0% (Safe, liquid, but low growth)</li>
                    <li><strong>Government Bonds (Treasuries):</strong> 3.0% – 5.0% (Very low risk, keeps pace with inflation)</li>
                    <li><strong>S&P 500 / Stock Market:</strong> 8.0% – 10.0% (Higher risk, historically the best wealth builder)</li>
                    <li><strong>Private Real Estate:</strong> 7.0% – 9.0% (Requires more capital and management)</li>
                </ul>
                <p>By diversifying your portfolio, you can aim for a higher average rate of return while managing the volatility that comes with compounding in the stock market.</p>

                <h3>Practical Strategies to Maximize Compounding</h3>
                <p>To get the most out of your financial future, follow these three steps:</p>
                <ol>
                    <li><strong>Automate your contributions:</strong> Treat your monthly contribution like a bill that must be paid. Automated transfers ensure you never forget to invest.</li>
                    <li><strong>Reinvest dividends:</strong> If you're investing in individual stocks or ETFs, ensure you've enabled "Dividend Reinvestment Plans" (DRIP). Cashing out dividends interrupts the compounding cycle.</li>
                    <li><strong>Avoid "Lifestyle Creep":</strong> As your salary increases, try to increase your monthly contribution rather than just increasing your spending. Even an extra $100 a month can result in tens of thousands of extra dollars over several decades.</li>
                </ol>
            </section>

            <FAQSection faqs={faqs} />

            <TryNextCalculator currentPath="/compound-interest-calculator" />
        </div>
    );
}
