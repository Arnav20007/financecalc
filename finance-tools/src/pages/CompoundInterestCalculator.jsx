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
import { calculateCompoundInterest } from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';
import { generatePDF } from '../utils/pdfGenerator';
import { useValidatedInputs } from '../utils/useValidatedInput';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

const faqs = [
    { question: 'What is compound interest?', answer: 'Compound interest is interest calculated on both the initial principal and the accumulated interest from previous periods. Unlike simple interest which only earns on the principal, compound interest creates a "snowball effect" where your earnings generate their own earnings, leading to exponential growth over time.' },
    { question: 'How often is interest compounded?', answer: 'Interest can be compounded at different frequencies: annually, semi-annually, quarterly, monthly, or daily. Our calculator uses monthly compounding, which is the most common for savings accounts and investments. More frequent compounding results in slightly higher returns.' },
    { question: 'What is the difference between simple and compound interest?', answer: 'Simple interest is calculated only on the original principal amount. Compound interest is calculated on the principal plus any previously earned interest. Over long periods, compound interest results in significantly higher returns. For example, $10,000 at 7% simple interest earns $700/year forever, but with compound interest, the earnings grow every year.' },
    { question: 'How do monthly contributions affect compound interest?', answer: 'Regular monthly contributions dramatically accelerate wealth building. Each contribution starts earning compound interest immediately, and the combined effect of consistent investing plus compounding creates a powerful wealth-building engine. Even small monthly amounts can grow to significant sums over decades.' },
    { question: 'What is the Rule of 72?', answer: 'The Rule of 72 is a quick way to estimate how long it takes for an investment to double. Simply divide 72 by the annual interest rate. For example, at 8% annual return, your money doubles in approximately 72/8 = 9 years. This is an approximation that works best for rates between 6% and 10%.' },
    { question: 'Are the results of this calculator guaranteed?', answer: 'No. This calculator provides estimates based on a constant rate of return. Real-world investment returns vary from year to year and are not guaranteed. The results are for educational and planning purposes only. Consult a qualified financial advisor for personalized investment advice.' },
];

const validationRules = {
    principal: { label: 'Initial Investment', min: 0, max: 100000000, required: true },
    monthly: { label: 'Monthly Contribution', min: 0, max: 1000000, required: true },
    rate: { label: 'Annual Interest Rate', min: 0, max: 50, allowDecimal: true, required: true },
    years: { label: 'Investment Period', min: 1, max: 100, allowDecimal: false, required: true },
};

export default function CompoundInterestCalculator() {
    const { values: inputs, errors, touched, handleChange, handleBlur, validateAll, getNumericValue } = useValidatedInputs(
        { principal: '10000', monthly: '500', rate: '7', years: '20' },
        validationRules
    );
    const [results, setResults] = useState(null);
    const [compareMode, setCompareMode] = useState(false);
    const [compareInputs, setCompareInputs] = useState({ principal: '10000', monthly: '500', rate: '10', years: '20' });
    const [compareResults, setCompareResults] = useState(null);
    const resultsRef = useRef(null);

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
            },
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
                <div className="form-grid">
                    <ValidatedInput
                        name="principal" label="Initial Investment" hint="(USD)"
                        value={inputs.principal} onChange={handleChange} onBlur={handleBlur}
                        error={errors.principal} touched={touched.principal}
                        prefix="$" min={0} step={100}
                    />
                    <ValidatedInput
                        name="monthly" label="Monthly Contribution" hint="(USD)"
                        value={inputs.monthly} onChange={handleChange} onBlur={handleBlur}
                        error={errors.monthly} touched={touched.monthly}
                        prefix="$" min={0} step={50}
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
                        <h3>Growth Projection</h3>
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

                    <AdSlot type="mid-content" />

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
                        <button className="btn-action" onClick={() => { setCompareMode(!compareMode); setCompareResults(null); }} type="button">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3h5v5" /><path d="M8 3H3v5" /><path d="M21 3l-7 7" /><path d="M3 3l7 7" /></svg>
                            {compareMode ? 'Hide Compare' : 'Compare Scenarios'}
                        </button>
                    </div>
                </div>
            )}

            <InternalLinks currentPath="/compound-interest-calculator" />

            <section className="seo-content">
                <h2>How Does Compound Interest Work?</h2>
                <p>Compound interest is one of the most powerful concepts in personal finance. Unlike simple interest, which is calculated only on the original principal amount, compound interest is calculated on the initial principal and also on the accumulated interest from previous periods. This creates an exponential growth curve that can turn even modest savings into significant wealth over time.</p>
                <p>The formula for compound interest is: A = P(1 + r/n)^(nt), where A is the final amount, P is the principal, r is the annual interest rate, n is the number of times interest compounds per year, and t is the number of years. Our calculator adds the complexity of regular monthly contributions, which significantly enhances the growth.</p>
                <h2>The Power of Starting Early</h2>
                <p>Time is the most critical factor in compound interest. Consider this: an investor who starts at age 25 and invests $500 per month at 7% annual return until age 65 will accumulate approximately $1.2 million. An investor starting at age 35 with the same parameters will accumulate only about $567,000 — less than half. That's the cost of waiting 10 years.</p>
                <h2>Monthly Contributions vs. Lump Sum</h2>
                <p>While lump sum investments have the advantage of maximizing time in the market, regular monthly contributions (also known as dollar-cost averaging) offer their own benefits. By investing a fixed amount regularly, you buy more shares when prices are low and fewer when they're high, potentially reducing the impact of market volatility on your portfolio.</p>
                <h2>Understanding Investment Returns</h2>
                <p>The annual interest rate you enter into the calculator represents your expected average annual return. Historical returns vary by asset class: the S&P 500 has averaged approximately 10% per year (about 7% after inflation) over the long term, while bonds typically return 3-5%, and savings accounts currently offer 4-5%.</p>
                <h2>Tax Considerations</h2>
                <p>The type of account you invest in significantly impacts your actual returns. Tax-advantaged accounts like 401(k)s and Roth IRAs allow your investments to grow tax-free or tax-deferred, maximizing the compound interest effect.</p>
                <ul>
                    <li><strong>Traditional 401(k)/IRA:</strong> Contributions are tax-deductible, but withdrawals are taxed as ordinary income in retirement.</li>
                    <li><strong>Roth 401(k)/IRA:</strong> Contributions are made with after-tax dollars, but all growth and withdrawals are completely tax-free.</li>
                    <li><strong>Taxable accounts:</strong> No contribution limits or withdrawal restrictions, but gains are taxed annually.</li>
                </ul>
            </section>

            <FAQSection faqs={faqs} />
            <AdSlot type="multiplex" />
            <TryNextCalculator currentPath="/compound-interest-calculator" />
        </div>
    );
}
