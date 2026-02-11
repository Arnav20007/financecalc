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
import { calculateCompoundInterest } from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';
import { generatePDF } from '../utils/pdfGenerator';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

const faqs = [
    { question: 'What is compound interest?', answer: 'Compound interest is interest calculated on both the initial principal and the accumulated interest from previous periods. Unlike simple interest which only earns on the principal, compound interest creates a "snowball effect" where your earnings generate their own earnings, leading to exponential growth over time.' },
    { question: 'How often is interest compounded?', answer: 'Interest can be compounded at different frequencies: annually, semi-annually, quarterly, monthly, or daily. Our calculator uses monthly compounding, which is the most common for savings accounts and investments. More frequent compounding results in slightly higher returns.' },
    { question: 'What is the difference between simple and compound interest?', answer: 'Simple interest is calculated only on the original principal amount. Compound interest is calculated on the principal plus any previously earned interest. Over long periods, compound interest results in significantly higher returns. For example, $10,000 at 7% simple interest earns $700/year forever, but with compound interest, the earnings grow every year.' },
    { question: 'How do monthly contributions affect compound interest?', answer: 'Regular monthly contributions dramatically accelerate wealth building. Each contribution starts earning compound interest immediately, and the combined effect of consistent investing plus compounding creates a powerful wealth-building engine. Even small monthly amounts can grow to significant sums over decades.' },
    { question: 'What is the Rule of 72?', answer: 'The Rule of 72 is a quick way to estimate how long it takes for an investment to double. Simply divide 72 by the annual interest rate. For example, at 8% annual return, your money doubles in approximately 72/8 = 9 years. This is an approximation that works best for rates between 6% and 10%.' },
    { question: 'Are the results of this calculator guaranteed?', answer: 'No. This calculator provides estimates based on a constant rate of return. Real-world investment returns vary from year to year and are not guaranteed. The results are for educational and planning purposes only. Consult a qualified financial advisor for personalized investment advice.' },
];

export default function CompoundInterestCalculator() {
    const [inputs, setInputs] = useState({ principal: 10000, monthly: 500, rate: 7, years: 20 });
    const [results, setResults] = useState(null);
    const [compareMode, setCompareMode] = useState(false);
    const [compareInputs, setCompareInputs] = useState({ principal: 10000, monthly: 500, rate: 10, years: 20 });
    const [compareResults, setCompareResults] = useState(null);
    const resultsRef = useRef(null);

    const handleCalculate = (e) => {
        e.preventDefault();
        const result = calculateCompoundInterest(
            parseFloat(inputs.principal), parseFloat(inputs.monthly),
            parseFloat(inputs.rate), parseInt(inputs.years)
        );
        setResults(result);
        if (compareMode) {
            const cResult = calculateCompoundInterest(
                parseFloat(compareInputs.principal), parseFloat(compareInputs.monthly),
                parseFloat(compareInputs.rate), parseInt(compareInputs.years)
            );
            setCompareResults(cResult);
        }
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    };

    const handleChange = (e) => setInputs({ ...inputs, [e.target.name]: e.target.value });
    const handleCompareChange = (e) => setCompareInputs({ ...compareInputs, [e.target.name]: e.target.value });

    const handleDownloadPDF = () => {
        if (!results) return;
        generatePDF('Compound Interest Results', [
            { label: 'Final Balance', value: formatCurrency(results.finalBalance) },
            { label: 'Total Contributions', value: formatCurrency(results.totalContributions) },
            { label: 'Total Interest Earned', value: formatCurrency(results.totalInterest) },
            { label: 'Initial Principal', value: formatCurrency(inputs.principal) },
            { label: 'Monthly Contribution', value: formatCurrency(inputs.monthly) },
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
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.05)',
                fill: true, tension: 0.3, pointRadius: 3,
            },
            {
                label: 'Total Contributions',
                data: results.breakdown.map(r => r.totalContributions),
                borderColor: '#94a3b8',
                backgroundColor: 'rgba(148, 163, 184, 0.05)',
                fill: true, tension: 0.3, pointRadius: 3, borderDash: [5, 5],
            },
            ...(compareMode && compareResults ? [{
                label: 'Scenario B Balance',
                data: compareResults.breakdown.map(r => r.balance),
                borderColor: '#7c3aed',
                backgroundColor: 'rgba(124, 58, 237, 0.05)',
                fill: false, tension: 0.3, pointRadius: 3, borderDash: [8, 4],
            }] : []),
        ],
    } : null;

    const doughnutData = results ? {
        labels: ['Total Contributions', 'Interest Earned'],
        datasets: [{
            data: [results.totalContributions, results.totalInterest],
            backgroundColor: ['#e2e8f0', '#2563eb'],
            borderColor: ['#fff', '#fff'],
            borderWidth: 3,
        }],
    } : null;

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

            <form className="calculator-form" onSubmit={handleCalculate} id="compound-interest-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="principal">Initial Investment <span className="label-hint">(USD)</span></label>
                        <input id="principal" name="principal" type="number" className="form-input" value={inputs.principal} onChange={handleChange} min="0" step="100" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="monthly">Monthly Contribution <span className="label-hint">(USD)</span></label>
                        <input id="monthly" name="monthly" type="number" className="form-input" value={inputs.monthly} onChange={handleChange} min="0" step="50" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="rate">Annual Interest Rate <span className="label-hint">(%)</span></label>
                        <input id="rate" name="rate" type="number" className="form-input" value={inputs.rate} onChange={handleChange} min="0" max="50" step="0.1" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="years">Investment Period <span className="label-hint">(years)</span></label>
                        <input id="years" name="years" type="number" className="form-input" value={inputs.years} onChange={handleChange} min="1" max="100" required />
                    </div>
                </div>

                {compareMode && (
                    <>
                        <h4 style={{ margin: '1.5rem 0 0.75rem', color: '#7c3aed' }}>Scenario B (Compare)</h4>
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
                            <div className="result-value small" style={{ color: '#059669' }}>{formatCurrency(results.totalInterest)}</div>
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

                    {/* Charts */}
                    <div className="chart-section">
                        <h3>Growth Projection</h3>
                        <div className="chart-container">
                            <Line data={lineChartData} options={{
                                responsive: true, maintainAspectRatio: false,
                                plugins: {
                                    legend: { position: 'top' },
                                    tooltip: {
                                        callbacks: {
                                            label: ctx => `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}`,
                                        },
                                    },
                                },
                                scales: {
                                    y: {
                                        ticks: { callback: v => formatCurrency(v) },
                                        grid: { color: 'rgba(0,0,0,0.04)' },
                                    },
                                    x: { grid: { display: false } },
                                },
                            }} />
                        </div>
                    </div>

                    <div className="chart-section">
                        <h3>Contributions vs Interest</h3>
                        <div style={{ maxWidth: 300, margin: '0 auto' }}>
                            <Doughnut data={doughnutData} options={{
                                responsive: true, plugins: {
                                    legend: { position: 'bottom' },
                                    tooltip: {
                                        callbacks: {
                                            label: ctx => `${ctx.label}: ${formatCurrency(ctx.raw)}`,
                                        },
                                    },
                                },
                            }} />
                        </div>
                    </div>

                    <AdSlot type="mid-content" />

                    {/* Breakdown Table */}
                    <div className="data-table-wrapper">
                        <div className="data-table-header">
                            <h3>Year-by-Year Breakdown</h3>
                        </div>
                        <div className="data-table-scroll">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Year</th>
                                        <th>Balance</th>
                                        <th>Total Contributions</th>
                                        <th>Yearly Interest</th>
                                        <th>Total Interest</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.breakdown.map(row => (
                                        <tr key={row.year}>
                                            <td>{row.year}</td>
                                            <td><strong>{formatCurrency(row.balance)}</strong></td>
                                            <td>{formatCurrency(row.totalContributions)}</td>
                                            <td style={{ color: '#059669' }}>+{formatCurrency(row.yearlyInterest)}</td>
                                            <td>{formatCurrency(row.totalInterest)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="actions-bar">
                        <button className="btn-action" onClick={handleDownloadPDF} type="button">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7,10 12,15 17,10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                            Download PDF
                        </button>
                        <ShareButton title="Compound Interest Results" text={`My investment of ${formatCurrency(inputs.principal)} could grow to ${formatCurrency(results.finalBalance)} in ${inputs.years} years!`} />
                        <button className="btn-action" onClick={() => { setCompareMode(!compareMode); setCompareResults(null); }} type="button">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3h5v5" /><path d="M8 3H3v5" /><path d="M21 3l-7 7" /><path d="M3 3l7 7" /><path d="M16 21h5v-5" /><path d="M8 21H3v-5" /><path d="M21 21l-7-7" /><path d="M3 21l7-7" /></svg>
                            {compareMode ? 'Hide Compare' : 'Compare Scenarios'}
                        </button>
                    </div>
                </div>
            )}

            <InternalLinks currentPath="/compound-interest-calculator" />

            {/* SEO Content */}
            <section className="seo-content">
                <h2>How Does Compound Interest Work?</h2>
                <p>
                    Compound interest is one of the most powerful concepts in personal finance. Unlike simple interest, which is calculated only on the original principal amount, compound interest is calculated on the initial principal and also on the accumulated interest from previous periods. This creates an exponential growth curve that can turn even modest savings into significant wealth over time.
                </p>
                <p>
                    The formula for compound interest is: A = P(1 + r/n)^(nt), where A is the final amount, P is the principal, r is the annual interest rate, n is the number of times interest compounds per year, and t is the number of years. Our calculator adds the complexity of regular monthly contributions, which significantly enhances the growth.
                </p>

                <h2>The Power of Starting Early</h2>
                <p>
                    Time is the most critical factor in compound interest. Consider this: an investor who starts at age 25 and invests $500 per month at 7% annual return until age 65 will accumulate approximately $1.2 million. An investor starting at age 35 with the same parameters will accumulate only about $567,000 — less than half. That's the cost of waiting 10 years. The earlier you start, the more time compound interest has to work its magic.
                </p>
                <p>
                    This is why financial advisors consistently recommend starting to invest as early as possible, even if the amounts are small. A 22-year-old investing just $200 per month has a significant advantage over a 35-year-old investing $500 per month, assuming similar returns. Starting early isn't just good advice — it's mathematics.
                </p>

                <h2>Monthly Contributions vs. Lump Sum</h2>
                <p>
                    While lump sum investments have the advantage of maximizing time in the market, regular monthly contributions (also known as dollar-cost averaging) offer their own benefits. By investing a fixed amount regularly, you buy more shares when prices are low and fewer when they're high, potentially reducing the impact of market volatility on your portfolio.
                </p>
                <p>
                    Our calculator allows you to model both scenarios: an initial lump sum combined with regular monthly contributions. This reflects how most people actually invest — with an initial amount plus ongoing additions from their income. Use the "Compare Scenarios" feature to see how different contribution levels affect your outcome.
                </p>

                <h2>Understanding Investment Returns</h2>
                <p>
                    The annual interest rate you enter into the calculator represents your expected average annual return. Historical returns vary by asset class: the S&P 500 has averaged approximately 10% per year (about 7% after inflation) over the long term, while bonds typically return 3-5%, and savings accounts currently offer 4-5%. Your actual rate should reflect your investment strategy and risk tolerance.
                </p>
                <p>
                    Keep in mind that real-world returns fluctuate significantly from year to year. The stock market might return 25% one year and lose 15% the next. Our calculator uses a constant rate for simplicity, but your actual results will vary. For long-term planning, using a conservative estimate (such as 6-7% for a diversified stock portfolio) is prudent.
                </p>

                <h2>Tax Considerations</h2>
                <p>
                    The type of account you invest in significantly impacts your actual returns. Tax-advantaged accounts like 401(k)s and Roth IRAs allow your investments to grow tax-free or tax-deferred, maximizing the compound interest effect. In a taxable brokerage account, you'll owe taxes on dividends and capital gains, which reduces the effective compound rate.
                </p>
                <ul>
                    <li><strong>Traditional 401(k)/IRA:</strong> Contributions are tax-deductible, but withdrawals are taxed as ordinary income in retirement.</li>
                    <li><strong>Roth 401(k)/IRA:</strong> Contributions are made with after-tax dollars, but all growth and withdrawals are completely tax-free.</li>
                    <li><strong>Taxable accounts:</strong> No contribution limits or withdrawal restrictions, but gains are taxed annually.</li>
                </ul>
                <p>
                    For the most accurate picture of your future wealth, consider which account type you'll be using and adjust the interest rate accordingly. Our calculator shows pre-tax growth, so your actual take-home amount may differ.
                </p>
            </section>

            <FAQSection faqs={faqs} />

            <AdSlot type="multiplex" />

            <TryNextCalculator currentPath="/compound-interest-calculator" />
        </div>
    );
}
