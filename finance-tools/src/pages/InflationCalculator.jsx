import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import SEOHead from '../components/common/SEOHead';
import FAQSection from '../components/common/FAQSection';
import TryNextCalculator from '../components/common/TryNextCalculator';
import InternalLinks from '../components/common/InternalLinks';
import AdSlot from '../components/common/AdSlot';
import ShareButton from '../components/common/ShareButton';
import { calculateInflation } from '../utils/calculations';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { generatePDF } from '../utils/pdfGenerator';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const faqs = [
    { question: 'What is inflation?', answer: 'Inflation is the rate at which the general level of prices for goods and services rises over time, eroding purchasing power. When inflation is 3%, something that costs $100 today would cost $103 a year from now. Central banks typically target an inflation rate of around 2% per year as healthy for the economy.' },
    { question: 'How is inflation measured?', answer: 'In the United States, inflation is primarily measured by the Consumer Price Index (CPI), published monthly by the Bureau of Labor Statistics. The CPI tracks the price of a basket of goods and services including food, housing, transportation, medical care, and entertainment. Another common measure is the Personal Consumption Expenditures (PCE) price index, which the Federal Reserve prefers.' },
    { question: 'What causes inflation?', answer: 'Inflation can be caused by several factors: demand-pull inflation (when demand exceeds supply), cost-push inflation (when production costs increase), or monetary inflation (when the money supply grows faster than the economy). Government fiscal policy, supply chain disruptions, and global economic conditions also contribute to inflationary pressures.' },
    { question: 'How does inflation affect savings?', answer: 'Inflation reduces the purchasing power of money held in cash or low-interest accounts. If your savings earn 1% interest but inflation is 3%, your real return is -2%, meaning your money is effectively losing value. This is why financial advisors recommend investing in assets that historically outpace inflation, such as stocks, real estate, or inflation-protected securities.' },
    { question: 'What is the average historical inflation rate?', answer: 'In the United States, the average annual inflation rate has been approximately 3.0-3.5% over the past century. However, inflation varies significantly by period: the 1970s saw rates exceeding 13%, while the 2010s experienced very low inflation around 1.5-2%. Understanding long-term trends helps in financial planning.' },
    { question: 'How can I protect my money from inflation?', answer: 'Common inflation hedges include: investing in stocks (which historically outpace inflation), real estate, Treasury Inflation-Protected Securities (TIPS), I-Bonds, commodities, and maintaining a diversified portfolio. Avoiding holding excess cash in low-interest accounts is the first step in protecting against inflation erosion.' },
];

export default function InflationCalculator() {
    const [inputs, setInputs] = useState({ currentValue: 100000, years: 25, inflationRate: 3 });
    const [results, setResults] = useState(null);
    const [compareMode, setCompareMode] = useState(false);
    const [compareRate, setCompareRate] = useState(5);
    const [compareResults, setCompareResults] = useState(null);
    const resultsRef = useRef(null);

    const handleCalculate = (e) => {
        e.preventDefault();
        const result = calculateInflation(
            parseFloat(inputs.currentValue), parseInt(inputs.years), parseFloat(inputs.inflationRate)
        );
        setResults(result);
        if (compareMode) {
            const cResult = calculateInflation(parseFloat(inputs.currentValue), parseInt(inputs.years), parseFloat(compareRate));
            setCompareResults(cResult);
        }
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    };

    const handleChange = (e) => setInputs({ ...inputs, [e.target.name]: e.target.value });

    const handleDownloadPDF = () => {
        if (!results) return;
        generatePDF('Inflation Impact Analysis', [
            { label: 'Current Value', value: formatCurrency(results.currentValue) },
            { label: 'Future Equivalent Cost', value: formatCurrency(results.futureEquivalent) },
            { label: 'Future Purchasing Power', value: formatCurrency(results.futurePurchasingPower) },
            { label: 'Total Inflation', value: formatPercent(results.totalInflation) },
            { label: 'Inflation Rate', value: `${inputs.inflationRate}%` },
            { label: 'Time Period', value: `${inputs.years} years` },
        ], results.breakdown, [
            { header: 'Year', accessor: r => r.year },
            { header: 'Future Cost', accessor: r => formatCurrency(r.futureValue) },
            { header: 'Purchasing Power', accessor: r => formatCurrency(r.purchasingPower) },
            { header: 'Value Eroded', accessor: r => formatCurrency(r.valueEroded) },
            { header: 'Cumulative Inflation', accessor: r => formatPercent(r.cumulativeInflation) },
        ]);
    };

    const lineChartData = results ? {
        labels: results.breakdown.map(r => `Year ${r.year}`),
        datasets: [
            {
                label: 'Future Cost (what it will cost)',
                data: results.breakdown.map(r => r.futureValue),
                borderColor: '#dc2626',
                backgroundColor: 'rgba(220, 38, 38, 0.05)',
                fill: true, tension: 0.3, pointRadius: 2,
            },
            {
                label: 'Purchasing Power (what your money buys)',
                data: results.breakdown.map(r => r.purchasingPower),
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.05)',
                fill: true, tension: 0.3, pointRadius: 2,
            },
            ...(compareMode && compareResults ? [{
                label: `Purchasing Power at ${compareRate}%`,
                data: compareResults.breakdown.map(r => r.purchasingPower),
                borderColor: '#7c3aed',
                fill: false, tension: 0.3, pointRadius: 2, borderDash: [5, 5],
            }] : []),
        ],
    } : null;

    const barChartData = results ? {
        labels: results.breakdown.filter((_, i) => (i + 1) % 5 === 0 || i === 0).map(r => `Year ${r.year}`),
        datasets: [{
            label: 'Value Eroded',
            data: results.breakdown.filter((_, i) => (i + 1) % 5 === 0 || i === 0).map(r => r.valueEroded),
            backgroundColor: 'rgba(220, 38, 38, 0.6)',
            borderRadius: 4,
        }],
    } : null;

    return (
        <div className="calculator-page">
            <SEOHead
                title="Inflation Calculator — Future Value & Purchasing Power Tool"
                description="Calculate how inflation erodes your purchasing power over time. See future costs, real value of money, and plan your finances to stay ahead of inflation."
                canonical="/inflation-calculator"
                faqSchema={faqs}
            />

            <nav className="breadcrumbs">
                <Link to="/">Home</Link><span>/</span><span>Inflation Calculator</span>
            </nav>

            <section className="calculator-hero">
                <h1>Inflation Calculator</h1>
                <p className="hero-subtitle">
                    Understand how inflation impacts your money. See the future cost of goods and the real purchasing power of your savings.
                </p>
            </section>

            <form className="calculator-form" onSubmit={handleCalculate} id="inflation-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="currentValue">Current Value <span className="label-hint">(USD)</span></label>
                        <input id="currentValue" name="currentValue" type="number" className="form-input" value={inputs.currentValue} onChange={handleChange} min="1" step="1000" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="years">Number of Years</label>
                        <input id="years" name="years" type="number" className="form-input" value={inputs.years} onChange={handleChange} min="1" max="100" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="inflationRate">Annual Inflation Rate <span className="label-hint">(%)</span></label>
                        <input id="inflationRate" name="inflationRate" type="number" className="form-input" value={inputs.inflationRate} onChange={handleChange} min="0.1" max="30" step="0.1" required />
                    </div>
                    {compareMode && (
                        <div className="form-group">
                            <label htmlFor="compareRate">Compare Rate <span className="label-hint">(%)</span></label>
                            <input id="compareRate" type="number" className="form-input" value={compareRate} onChange={(e) => setCompareRate(e.target.value)} min="0.1" max="30" step="0.1" />
                        </div>
                    )}
                </div>
                <button type="submit" className="btn-calculate" id="calculate-inflation" style={{ marginTop: '1.25rem' }}>
                    Calculate Inflation Impact
                </button>
            </form>

            {results && (
                <div className="results-section" ref={resultsRef}>
                    <div className="results-summary">
                        <div className="result-card" style={{ borderColor: '#dc2626', background: '#fef2f2' }}>
                            <div className="result-label">Future Equivalent Cost</div>
                            <div className="result-value small" style={{ color: '#dc2626' }}>{formatCurrency(results.futureEquivalent)}</div>
                        </div>
                        <div className="result-card highlight">
                            <div className="result-label">Your Money Will Be Worth</div>
                            <div className="result-value">{formatCurrency(results.futurePurchasingPower)}</div>
                        </div>
                        <div className="result-card">
                            <div className="result-label">Total Inflation</div>
                            <div className="result-value small">{formatPercent(results.totalInflation)}</div>
                        </div>
                    </div>

                    {compareMode && compareResults && (
                        <div className="compare-results">
                            <div className="compare-column scenario-a">
                                <h4>At {inputs.inflationRate}% Inflation</h4>
                                <div className="result-label">Purchasing Power</div>
                                <div className="result-value small">{formatCurrency(results.futurePurchasingPower)}</div>
                                <div className="result-label" style={{ marginTop: '0.75rem' }}>Total Inflation</div>
                                <div className="result-value small">{formatPercent(results.totalInflation)}</div>
                            </div>
                            <div className="compare-column scenario-b">
                                <h4>At {compareRate}% Inflation</h4>
                                <div className="result-label">Purchasing Power</div>
                                <div className="result-value small">{formatCurrency(compareResults.futurePurchasingPower)}</div>
                                <div className="result-label" style={{ marginTop: '0.75rem' }}>Total Inflation</div>
                                <div className="result-value small">{formatPercent(compareResults.totalInflation)}</div>
                            </div>
                        </div>
                    )}

                    <div className="chart-section">
                        <h3>Inflation Impact Over Time</h3>
                        <div className="chart-container">
                            <Line data={lineChartData} options={{
                                responsive: true, maintainAspectRatio: false,
                                plugins: { legend: { position: 'top' }, tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}` } } },
                                scales: { y: { ticks: { callback: v => formatCurrency(v) }, grid: { color: 'rgba(0,0,0,0.04)' } }, x: { grid: { display: false } } },
                            }} />
                        </div>
                    </div>

                    <div className="chart-section">
                        <h3>Value Erosion Over Time</h3>
                        <div className="chart-container">
                            <Bar data={barChartData} options={{
                                responsive: true, maintainAspectRatio: false,
                                plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `Value Eroded: ${formatCurrency(ctx.raw)}` } } },
                                scales: { y: { ticks: { callback: v => formatCurrency(v) }, grid: { color: 'rgba(0,0,0,0.04)' } }, x: { grid: { display: false } } },
                            }} />
                        </div>
                    </div>

                    <AdSlot type="mid-content" />

                    <div className="data-table-wrapper">
                        <div className="data-table-header"><h3>Year-by-Year Inflation Breakdown</h3></div>
                        <div className="data-table-scroll">
                            <table className="data-table">
                                <thead>
                                    <tr><th>Year</th><th>Future Cost</th><th>Purchasing Power</th><th>Value Eroded</th><th>Cumulative Inflation</th></tr>
                                </thead>
                                <tbody>
                                    {results.breakdown.map(row => (
                                        <tr key={row.year}>
                                            <td>{row.year}</td>
                                            <td style={{ color: '#dc2626' }}>{formatCurrency(row.futureValue)}</td>
                                            <td>{formatCurrency(row.purchasingPower)}</td>
                                            <td style={{ color: '#f97316' }}>-{formatCurrency(row.valueEroded)}</td>
                                            <td>{formatPercent(row.cumulativeInflation)}</td>
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
                        <ShareButton title="Inflation Impact" text={`${formatCurrency(inputs.currentValue)} today will only be worth ${formatCurrency(results.futurePurchasingPower)} in ${inputs.years} years at ${inputs.inflationRate}% inflation.`} />
                        <button className="btn-action" onClick={() => { setCompareMode(!compareMode); setCompareResults(null); }} type="button">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3h5v5" /><path d="M8 3H3v5" /><path d="M21 3l-7 7" /><path d="M3 3l7 7" /></svg>
                            {compareMode ? 'Hide Compare' : 'Compare Rates'}
                        </button>
                    </div>
                </div>
            )}

            <InternalLinks currentPath="/inflation-calculator" />

            <section className="seo-content">
                <h2>Understanding the Impact of Inflation</h2>
                <p>
                    Inflation is often called the "silent wealth killer" because it gradually erodes the purchasing power of your money without any visible change to your bank balance. While your account might show $100,000, the real value of that money — what it can actually buy — decreases every year. Understanding this fundamental economic force is essential for effective financial planning.
                </p>
                <p>
                    Consider this: at just 3% annual inflation, the purchasing power of $100,000 drops to about $47,760 in 25 years. That means something that costs $100,000 today would cost approximately $209,378 in 25 years. This calculator helps you visualize exactly how inflation impacts your specific financial situation.
                </p>

                <h2>Historical Inflation Trends</h2>
                <p>
                    The United States has experienced varying levels of inflation throughout its history. The post-World War II era saw moderate inflation averaging 3-4% annually. The 1970s brought stagflation with rates exceeding 13%. The Great Moderation period (1980s-2000s) saw inflation gradually decline to 2-3%. More recently, the post-COVID era experienced a spike to over 9% in 2022 before moderating back toward the Federal Reserve's 2% target.
                </p>
                <p>
                    Understanding these historical patterns helps put current inflation in context. While short-term spikes can be alarming, long-term financial planning should focus on the average rate over your planning horizon. For most long-term projections, using 2.5-3.5% annual inflation is reasonable.
                </p>

                <h2>How Inflation Affects Different Expenses</h2>
                <p>
                    Not all prices rise at the same rate. Some categories consistently outpace general inflation, while others may even decrease over time:
                </p>
                <ul>
                    <li><strong>Healthcare:</strong> Has historically inflated at 5-7% annually, roughly double the general rate. This makes healthcare planning especially critical for retirees.</li>
                    <li><strong>Education:</strong> College tuition has increased at approximately 5-8% annually for decades, far exceeding general inflation.</li>
                    <li><strong>Housing:</strong> Home prices generally track or slightly exceed overall inflation, though with significant regional variation.</li>
                    <li><strong>Technology:</strong> One of the few categories where prices consistently fall. The computing power you get per dollar increases dramatically over time.</li>
                    <li><strong>Food:</strong> Generally tracks close to the overall CPI, though with notable short-term volatility due to weather, supply chains, and energy costs.</li>
                </ul>

                <h2>Protecting Your Wealth from Inflation</h2>
                <p>
                    The key to fighting inflation is ensuring your money grows faster than prices rise. Here are proven strategies to maintain and grow your purchasing power:
                </p>
                <p>
                    <strong>Equities (Stocks):</strong> Historically, the stock market has returned approximately 10% annually (about 7% after inflation), making it one of the best long-term inflation hedges. Companies can raise prices to keep pace with inflation, passing through costs to consumers and maintaining profitability.
                </p>
                <p>
                    <strong>Real Estate:</strong> Property values and rental income tend to rise with inflation, making real estate another effective hedge. REITs (Real Estate Investment Trusts) offer stock-market-accessible exposure to real estate returns.
                </p>
                <p>
                    <strong>TIPS and I-Bonds:</strong> Treasury Inflation-Protected Securities (TIPS) and Series I Savings Bonds are government-backed securities specifically designed to protect against inflation. Their principal or interest rates adjust based on the CPI, guaranteeing a real return above inflation.
                </p>
                <p>
                    <strong>Diversification:</strong> The best inflation protection comes from a well-diversified portfolio that includes a mix of stocks, real estate, commodities, and inflation-protected bonds. No single asset class is the perfect hedge in all environments.
                </p>
            </section>

            <FAQSection faqs={faqs} />
            <AdSlot type="multiplex" />
            <TryNextCalculator currentPath="/inflation-calculator" />
        </div>
    );
}
