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
import { calculateRetirement } from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';
import { generatePDF } from '../utils/pdfGenerator';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

const faqs = [
    { question: 'How much do I need to retire?', answer: 'A common guideline is to have 25 times your annual expenses saved by retirement (based on the 4% withdrawal rule). For example, if you need $60,000 per year in retirement, you should aim for a $1.5 million portfolio. However, the exact amount depends on your lifestyle, healthcare costs, Social Security benefits, and expected longevity.' },
    { question: 'What is the 4% rule?', answer: 'The 4% rule suggests that you can withdraw 4% of your retirement portfolio in the first year, then adjust that amount for inflation each subsequent year, and your money should last at least 30 years. This rule is based on historical market data. Some financial planners now recommend a more conservative 3-3.5% withdrawal rate given current economic conditions.' },
    { question: 'When should I start saving for retirement?', answer: 'The best time to start saving for retirement is as early as possible. Thanks to compound interest, money invested in your 20s has significantly more time to grow than money invested in your 40s. Even small amounts invested early can grow to substantial sums. If you haven\'t started yet, the second-best time is now.' },
    { question: 'What rate of return should I assume?', answer: 'For a diversified portfolio of stocks and bonds, a reasonable long-term assumption is 6-8% annually before inflation (3-5% after inflation). More conservative investors might use 5-6%, while aggressive growth portfolios have historically returned 8-10%. The key is to use a rate that matches your investment strategy and risk tolerance.' },
    { question: 'How does Social Security factor in?', answer: 'Social Security benefits can provide a significant base of retirement income. The average monthly benefit is around $1,800, but your actual benefit depends on your earnings history and when you claim. You can check your estimated benefits at ssa.gov. Our calculator focuses on personal savings — consider Social Security as additional income on top of your portfolio withdrawals.' },
    { question: 'Should I use a Roth IRA or Traditional IRA?', answer: 'The choice depends on your current vs. expected future tax bracket. If you expect to be in a higher bracket in retirement, Roth (pay taxes now) is better. If you expect a lower bracket, Traditional (tax deduction now, pay taxes later) may be advantageous. Many advisors recommend having both types for tax diversification in retirement.' },
];

export default function RetirementCalculator() {
    const [inputs, setInputs] = useState({
        currentAge: 30, retirementAge: 65, currentSavings: 50000,
        monthlyContribution: 1000, expectedReturn: 7, withdrawalRate: 4,
    });
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');
    const resultsRef = useRef(null);

    const handleCalculate = (e) => {
        e.preventDefault();
        setError('');
        const result = calculateRetirement(
            parseInt(inputs.currentAge), parseInt(inputs.retirementAge),
            parseFloat(inputs.currentSavings), parseFloat(inputs.monthlyContribution),
            parseFloat(inputs.expectedReturn), parseFloat(inputs.withdrawalRate)
        );
        if (result.error) { setError(result.error); setResults(null); return; }
        setResults(result);
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    };

    const handleChange = (e) => setInputs({ ...inputs, [e.target.name]: e.target.value });

    const handleDownloadPDF = () => {
        if (!results) return;
        generatePDF('Retirement Projection', [
            { label: 'Retirement Corpus', value: formatCurrency(results.retirementCorpus) },
            { label: 'Total Contributions', value: formatCurrency(results.totalContributions) },
            { label: 'Investment Growth', value: formatCurrency(results.totalGrowth) },
            { label: 'Annual Withdrawal', value: formatCurrency(results.annualWithdrawal) },
            { label: 'Monthly Withdrawal', value: formatCurrency(results.monthlyWithdrawal) },
            { label: 'Current Age', value: inputs.currentAge },
            { label: 'Retirement Age', value: inputs.retirementAge },
        ], results.projection, [
            { header: 'Age', accessor: r => r.age },
            { header: 'Year', accessor: r => r.year },
            { header: 'Balance', accessor: r => formatCurrency(r.balance) },
            { header: 'Contributions', accessor: r => formatCurrency(r.totalContributions) },
            { header: 'Growth', accessor: r => formatCurrency(r.yearlyGrowth) },
        ]);
    };

    const lineChartData = results ? {
        labels: results.projection.map(r => `Age ${r.age}`),
        datasets: [
            {
                label: 'Portfolio Value',
                data: results.projection.map(r => r.balance),
                borderColor: '#059669',
                backgroundColor: 'rgba(5, 150, 105, 0.05)',
                fill: true, tension: 0.3, pointRadius: 2,
            },
            {
                label: 'Total Contributions',
                data: results.projection.map(r => r.totalContributions),
                borderColor: '#94a3b8',
                backgroundColor: 'rgba(148, 163, 184, 0.05)',
                fill: true, tension: 0.3, pointRadius: 2, borderDash: [5, 5],
            },
        ],
    } : null;

    const doughnutData = results ? {
        labels: ['Contributions', 'Investment Growth'],
        datasets: [{
            data: [results.totalContributions, results.totalGrowth],
            backgroundColor: ['#e2e8f0', '#059669'],
            borderColor: ['#fff', '#fff'],
            borderWidth: 3,
        }],
    } : null;

    return (
        <div className="calculator-page">
            <SEOHead
                title="Retirement Calculator — Free Retirement Savings Projection"
                description="Calculate how much you need to retire comfortably. Project your retirement corpus, estimate monthly withdrawal income, and create a personalized retirement savings plan."
                canonical="/retirement-calculator"
                faqSchema={faqs}
            />

            <nav className="breadcrumbs">
                <Link to="/">Home</Link><span>/</span><span>Retirement Calculator</span>
            </nav>

            <section className="calculator-hero">
                <h1>Retirement Calculator</h1>
                <p className="hero-subtitle">
                    Project your retirement nest egg and estimate your future monthly income. Start planning your financial independence today.
                </p>
            </section>

            <form className="calculator-form" onSubmit={handleCalculate} id="retirement-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="currentAge">Current Age</label>
                        <input id="currentAge" name="currentAge" type="number" className="form-input" value={inputs.currentAge} onChange={handleChange} min="18" max="80" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="retirementAge">Retirement Age</label>
                        <input id="retirementAge" name="retirementAge" type="number" className="form-input" value={inputs.retirementAge} onChange={handleChange} min="30" max="100" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="currentSavings">Current Savings <span className="label-hint">(USD)</span></label>
                        <input id="currentSavings" name="currentSavings" type="number" className="form-input" value={inputs.currentSavings} onChange={handleChange} min="0" step="1000" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="monthlyContribution">Monthly Contribution <span className="label-hint">(USD)</span></label>
                        <input id="monthlyContribution" name="monthlyContribution" type="number" className="form-input" value={inputs.monthlyContribution} onChange={handleChange} min="0" step="50" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="expectedReturn">Expected Annual Return <span className="label-hint">(%)</span></label>
                        <input id="expectedReturn" name="expectedReturn" type="number" className="form-input" value={inputs.expectedReturn} onChange={handleChange} min="0" max="30" step="0.1" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="withdrawalRate">Safe Withdrawal Rate <span className="label-hint">(%)</span></label>
                        <input id="withdrawalRate" name="withdrawalRate" type="number" className="form-input" value={inputs.withdrawalRate} onChange={handleChange} min="1" max="10" step="0.1" required />
                    </div>
                </div>
                {error && <p style={{ color: 'var(--color-error)', marginTop: '0.75rem', fontSize: '0.875rem' }}>{error}</p>}
                <button type="submit" className="btn-calculate" id="calculate-retirement" style={{ marginTop: '1.25rem' }}>
                    Calculate Retirement Projection
                </button>
            </form>

            {results && (
                <div className="results-section" ref={resultsRef}>
                    <div className="results-summary">
                        <div className="result-card highlight">
                            <div className="result-label">Retirement Corpus</div>
                            <div className="result-value">{formatCurrency(results.retirementCorpus)}</div>
                        </div>
                        <div className="result-card success">
                            <div className="result-label">Monthly Withdrawal</div>
                            <div className="result-value small" style={{ color: '#059669' }}>{formatCurrency(results.monthlyWithdrawal)}</div>
                        </div>
                        <div className="result-card">
                            <div className="result-label">Annual Withdrawal</div>
                            <div className="result-value small">{formatCurrency(results.annualWithdrawal)}</div>
                        </div>
                        <div className="result-card">
                            <div className="result-label">Investment Growth</div>
                            <div className="result-value small" style={{ color: '#059669' }}>{formatCurrency(results.totalGrowth)}</div>
                        </div>
                    </div>

                    <div className="chart-section">
                        <h3>Portfolio Growth Projection</h3>
                        <div className="chart-container">
                            <Line data={lineChartData} options={{
                                responsive: true, maintainAspectRatio: false,
                                plugins: { legend: { position: 'top' }, tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}` } } },
                                scales: { y: { ticks: { callback: v => formatCurrency(v) }, grid: { color: 'rgba(0,0,0,0.04)' } }, x: { grid: { display: false } } },
                            }} />
                        </div>
                    </div>

                    <div className="chart-section">
                        <h3>Contributions vs Growth</h3>
                        <div style={{ maxWidth: 300, margin: '0 auto' }}>
                            <Doughnut data={doughnutData} options={{
                                responsive: true, plugins: { legend: { position: 'bottom' }, tooltip: { callbacks: { label: ctx => `${ctx.label}: ${formatCurrency(ctx.raw)}` } } },
                            }} />
                        </div>
                    </div>

                    <AdSlot type="mid-content" />

                    <div className="data-table-wrapper">
                        <div className="data-table-header"><h3>Year-by-Year Projection</h3></div>
                        <div className="data-table-scroll">
                            <table className="data-table">
                                <thead>
                                    <tr><th>Age</th><th>Portfolio Value</th><th>Contributions</th><th>Yearly Growth</th></tr>
                                </thead>
                                <tbody>
                                    {results.projection.map(row => (
                                        <tr key={row.year}>
                                            <td>{row.age}</td>
                                            <td><strong>{formatCurrency(row.balance)}</strong></td>
                                            <td>{formatCurrency(row.totalContributions)}</td>
                                            <td style={{ color: '#059669' }}>+{formatCurrency(row.yearlyGrowth)}</td>
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
                        <ShareButton title="Retirement Projection" text={`By age ${inputs.retirementAge}, I could have ${formatCurrency(results.retirementCorpus)} for retirement!`} />
                    </div>
                </div>
            )}

            <InternalLinks currentPath="/retirement-calculator" />

            <section className="seo-content">
                <h2>How Much Do You Need to Retire?</h2>
                <p>
                    Determining your retirement savings goal is one of the most important financial planning exercises you can undertake. While there's no one-size-fits-all answer, several established guidelines can help you arrive at a target number that works for your unique situation and lifestyle expectations.
                </p>
                <p>
                    The most widely cited rule of thumb is the "25x rule" — save 25 times your expected annual expenses in retirement. This is the inverse of the 4% withdrawal rule, which suggests you can safely withdraw 4% of your portfolio in the first year of retirement (adjusting for inflation thereafter) and have a high probability of not running out of money over a 30-year retirement.
                </p>

                <h2>The Impact of Starting Early</h2>
                <p>
                    When it comes to retirement savings, time is your greatest asset. Consider two savers: Alex starts investing $500/month at age 25 and stops at 35 (10 years, $60,000 total contributions). Jordan starts investing $500/month at age 35 and continues until 65 (30 years, $180,000 total contributions). Assuming 7% annual returns, Alex would have approximately $602,000 at age 65, while Jordan would have about $567,000. Despite contributing three times more money, Jordan ends up with less — that's the extraordinary power of early compound growth.
                </p>

                <h2>Understanding the 4% Rule</h2>
                <p>
                    The 4% rule originated from the "Trinity Study" published in 1998, which analyzed historical market data to determine sustainable withdrawal rates for retirees. The study found that a 4% initial withdrawal rate, adjusted annually for inflation, had a high probability of sustaining a portfolio over 30 years across various historical market conditions.
                </p>
                <p>
                    However, the 4% rule has limitations. It was based on U.S. market data during a period of strong returns, and future returns may be different. Many modern financial planners recommend a more flexible approach — reducing withdrawals during market downturns and potentially spending more during strong markets. Some suggest a 3-3.5% withdrawal rate for greater safety, especially for early retirees who need their money to last longer than 30 years.
                </p>

                <h2>Retirement Account Types</h2>
                <p>
                    Choosing the right retirement accounts is crucial for maximizing your savings. The three main types of retirement accounts each offer different tax advantages:
                </p>
                <ul>
                    <li><strong>401(k) / 403(b):</strong> Employer-sponsored plans with high contribution limits ($23,500 in 2025). Many employers offer matching contributions — always contribute enough to get the full match, as it's essentially free money.</li>
                    <li><strong>Traditional IRA:</strong> Tax-deductible contributions that grow tax-deferred. Annual contribution limit of $7,000 ($8,000 if over 50). Best if you expect to be in a lower tax bracket in retirement.</li>
                    <li><strong>Roth IRA:</strong> After-tax contributions that grow and can be withdrawn completely tax-free. Same contribution limits as Traditional IRA. Best if you expect to be in a higher tax bracket in retirement or want tax diversification.</li>
                </ul>

                <h2>Healthcare Costs in Retirement</h2>
                <p>
                    One of the most significant and often underestimated retirement expenses is healthcare. According to Fidelity's Retiree Health Care Cost Estimate, an average retired couple at age 65 may need approximately $315,000 saved to cover healthcare expenses in retirement. This includes Medicare premiums, out-of-pocket costs, and supplemental insurance, but excludes long-term care costs.
                </p>
                <p>
                    If you're planning to retire before age 65 (when Medicare eligibility begins), you'll need to account for potentially expensive private health insurance during the gap years. This is a critical consideration for the FIRE (Financial Independence, Retire Early) movement.
                </p>
            </section>

            <FAQSection faqs={faqs} />
            <AdSlot type="multiplex" />
            <TryNextCalculator currentPath="/retirement-calculator" />
        </div>
    );
}
