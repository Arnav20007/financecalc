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
import ValidatedInput from '../components/common/ValidatedInput';
import PrivacyBadge from '../components/common/PrivacyBadge';
import { useCurrency } from '../context/CurrencyContext';
import { calculateInflation } from '../utils/calculations';
import { generatePDF } from '../utils/pdfGenerator';
import { useValidatedInputs } from '../utils/useValidatedInput';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const faqs = [
    { question: 'What is inflation?', answer: 'Inflation is the rate at which the general level of prices for goods and services rises. When inflation occurs, each unit of currency buys fewer goods and services; consequently, inflation reflects a reduction in the purchasing power per unit of money.' },
    { question: 'How does inflation affect my savings?', answer: 'If your savings earn less interest than the inflation rate, your money loses purchasing power over time. For example, if you have 2% interest on your savings but inflation is 3%, you are effectively losing 1% of your wealth every year.' },
    { question: 'What has the historical inflation rate been?', answer: 'In the United States, inflation has averaged about 3.2% per year over the past century. However, this has fluctuated from negative (deflation) in the 1930s to over 13% in the late 1970s.' },
    { question: 'How can I protect my money from inflation?', answer: 'Traditional hedges include Treasury Inflation-Protected Securities (TIPS), real estate, and stocks. Companies can often raise prices to match inflation, allowing their stock price to keep pace, whereas cash in a mattress simply loses value.' },
    { question: 'What is the CPI?', answer: 'The Consumer Price Index (CPI) measures the average change over time in the prices paid by urban consumers for a market basket of consumer goods and services. It is the most widely used measure of inflation.' },
    { question: 'What is "Hyperinflation"?', answer: 'Hyperinflation is a term used to describe rapid, excessive, and out-of-control general price increases in an economy. While regular inflation is measured in terms of monthly price increases, hyperinflation is typically defined as inflation exceeding 50% per month.' },
    { question: 'Does inflation affect debt?', answer: 'In a way, inflation can be good for borrowers. If you have a fixed-rate loan (like a 30-year mortgage), you are paying back the debt with "cheaper" dollars over time. However, it is bad for lenders for the same reason.' },
    { question: 'What is the "Wage-Price Spiral"?', answer: 'This is an economic phenomenon where rising prices lead workers to demand higher wages, which then increases production costs for companies, causing them to raise prices even further, creating a continuous loop.' },
    { question: 'How do central banks control inflation?', answer: 'Central banks, like the Federal Reserve, typically control inflation by adjusting interest rates. When inflation is too high, they raise interest rates to slow down spending and "cool" the economy.' },
    { question: 'How does inflation impact retirement planning?', answer: 'Inflation makes future expenses higher. If you plan to retire in 30 years, a $5,000 monthly lifestyle today could easily cost $12,000 to $15,000 per month by the time you stop working. This is why investing for growth is critical.' },
];

const validationRules = {
    currentValue: { label: 'Current Value', min: 1, max: 100000000, required: true },
    years: { label: 'Time Period', min: 1, max: 100, allowDecimal: false, required: true },
    inflationRate: { label: 'Inflation Rate', min: 0, max: 30, allowDecimal: true, required: true },
};

export default function InflationCalculator() {
    const { formatCurrency, symbol } = useCurrency();
    const { values: inputs, errors, touched, handleChange, handleBlur, validateAll, getNumericValue, setValues } = useValidatedInputs(
        { currentValue: '100000', years: '25', inflationRate: '3' },
        validationRules
    );
    const [results, setResults] = useState(null);
    const [compareMode, setCompareMode] = useState(false);
    const [compareRate, setCompareRate] = useState('5');
    const [compareResults, setCompareResults] = useState(null);
    const [copied, setCopied] = useState(false);
    const resultsRef = useRef(null);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const loadExample = () => {
        setValues({ currentValue: '200000', years: '30', inflationRate: '3.5' });
        setResults(null);
    };

    const handleCalculate = (e) => {
        e.preventDefault();
        if (!validateAll()) return;
        const result = calculateInflation(getNumericValue('currentValue'), parseInt(inputs.years), getNumericValue('inflationRate'));
        setResults(result);
        if (compareMode) {
            const cResult = calculateInflation(getNumericValue('currentValue'), parseInt(inputs.years), parseFloat(compareRate) || 0);
            setCompareResults(cResult);
        }
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    };

    const handleDownloadPDF = () => {
        if (!results) return;
        generatePDF('Inflation Analysis', [
            { label: 'Current Value', value: formatCurrency(getNumericValue('currentValue')) },
            { label: 'Inflation Rate', value: `${inputs.inflationRate}%` },
            { label: 'Time Period', value: `${inputs.years} years` },
            { label: 'Future Equivalent', value: formatCurrency(results.futureValue) },
            { label: 'Purchasing Power', value: formatCurrency(results.purchasingPower) },
            { label: 'Value Lost to Inflation', value: formatCurrency(results.valueEroded) },
        ], null, null);
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

    const lineData = results ? {
        labels: results.yearlyData.map(d => `Year ${d.year}`),
        datasets: [
            { label: 'Future Cost (Inflation)', data: results.yearlyData.map(d => d.futureValue), borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.08)', fill: true, tension: 0.4, pointRadius: 2 },
            { label: 'Purchasing Power (Today\'s $)', data: results.yearlyData.map(d => d.purchasingPower), borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.08)', fill: true, tension: 0.4, pointRadius: 2, borderDash: [5, 5] },
            ...(compareMode && compareResults ? [
                { label: `Compare (${compareRate}%)`, data: compareResults.yearlyData.map(d => d.futureValue), borderColor: '#f59e0b', fill: false, tension: 0.4, pointRadius: 2, borderDash: [8, 4] },
            ] : []),
        ],
    } : null;

    const barData = results ? {
        labels: results.yearlyData.filter((_, i) => i % 5 === 4 || i === 0).map(d => `Year ${d.year}`),
        datasets: [
            { label: 'Value Lost', data: results.yearlyData.filter((_, i) => i % 5 === 4 || i === 0).map(d => getNumericValue('currentValue') - d.purchasingPower), backgroundColor: 'rgba(239,68,68,0.5)', borderColor: 'rgba(239,68,68,0.8)', borderWidth: 1, borderRadius: 6 },
            { label: 'Remaining Power', data: results.yearlyData.filter((_, i) => i % 5 === 4 || i === 0).map(d => d.purchasingPower), backgroundColor: 'rgba(59,130,246,0.5)', borderColor: 'rgba(59,130,246,0.8)', borderWidth: 1, borderRadius: 6 },
        ],
    } : null;

    return (
        <div className="calculator-page">
            <SEOHead title="Inflation Calculator — Purchasing Power Analysis" description="See how inflation erodes your purchasing power over time." canonical="/inflation-calculator" faqSchema={faqs} />
            <nav className="breadcrumbs"><Link to="/">Home</Link><span>/</span><span>Inflation Calculator</span></nav>
            <section className="calculator-hero"><h1>Inflation Calculator</h1><p className="hero-subtitle">Understand how inflation silently erodes your purchasing power and plan accordingly.</p></section>

            <form className="calculator-form" onSubmit={handleCalculate} id="inflation-form" noValidate>
                <div className="form-top-actions">
                    <button type="button" className="btn-load-example" onClick={loadExample}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14,2 14,8 20,8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                        Load Example
                    </button>
                </div>
                <div className="form-grid">
                    <ValidatedInput name="currentValue" label="Current Value" value={inputs.currentValue} onChange={handleChange} onBlur={handleBlur} error={errors.currentValue} touched={touched.currentValue} prefix={symbol} min={1} step={1000} />
                    <ValidatedInput name="years" label="Time Period" hint="(years)" value={inputs.years} onChange={handleChange} onBlur={handleBlur} error={errors.years} touched={touched.years} suffix="yrs" min={1} max={100} />
                    <ValidatedInput name="inflationRate" label="Expected Inflation Rate" hint="(%)" value={inputs.inflationRate} onChange={handleChange} onBlur={handleBlur} error={errors.inflationRate} touched={touched.inflationRate} suffix="%" min={0} max={30} step={0.1} className="full-width" />
                </div>
                {compareMode && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-md)' }}>
                        <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f59e0b', marginBottom: '0.5rem', display: 'block' }}>Compare Inflation Rate (%)</label>
                        <input type="number" className="form-input" value={compareRate} onChange={e => setCompareRate(e.target.value)} min="0" max="30" step="0.1" />
                    </div>
                )}
                <button type="submit" className="btn-calculate" style={{ marginTop: '1.25rem' }}>Calculate Inflation Impact</button>
                <PrivacyBadge />
            </form>

            {results && (
                <div className="results-section" ref={resultsRef}>
                    <div className="results-summary">
                        <div className="result-card" style={{ borderColor: 'rgba(239,68,68,0.3)' }}><div className="result-label">Future Equivalent Cost</div><div className="result-value small" style={{ color: '#ef4444' }}>{formatCurrency(results.futureValue)}</div></div>
                        <div className="result-card highlight"><div className="result-label">Purchasing Power</div><div className="result-value">{formatCurrency(results.purchasingPower)}</div></div>
                        <div className="result-card"><div className="result-label">Value Eroded</div><div className="result-value small" style={{ color: '#f97316' }}>{formatCurrency(results.valueEroded)}</div></div>
                    </div>

                    {compareMode && compareResults && (
                        <div className="compare-results">
                            <div className="compare-column scenario-a"><h4>{inputs.inflationRate}% Rate</h4><div className="result-label">Future Cost</div><div className="result-value small">{formatCurrency(results.futureValue)}</div><div className="result-label" style={{ marginTop: '0.5rem' }}>Value Eroded</div><div className="result-value small">{formatCurrency(results.valueEroded)}</div></div>
                            <div className="compare-column scenario-b"><h4>{compareRate}% Rate</h4><div className="result-label">Future Cost</div><div className="result-value small">{formatCurrency(compareResults.futureValue)}</div><div className="result-label" style={{ marginTop: '0.5rem' }}>Value Eroded</div><div className="result-value small">{formatCurrency(compareResults.valueEroded)}</div></div>
                        </div>
                    )}

                    <div className="chart-section"><h3>Future Cost & Purchasing Power</h3><div className="chart-container"><Line data={lineData} options={chartOpts} /></div></div>
                    <div className="chart-section"><h3>Value Erosion Over Time</h3><div className="chart-container"><Bar data={barData} options={{ ...chartOpts, scales: { ...chartOpts.scales, x: { ...chartOpts.scales.x, stacked: true }, y: { ...chartOpts.scales.y, stacked: true } } }} /></div></div>


                    <div className="actions-bar">
                        <button className="btn-action" onClick={handleDownloadPDF} type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7,10 12,15 17,10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>Download PDF</button>
                        <ShareButton title="Inflation Impact" text={`At ${inputs.inflationRate}% inflation, ${formatCurrency(getNumericValue('currentValue'))} today will need ${formatCurrency(results.futureValue)} in ${inputs.years} years!`} />
                        <button className="btn-action" onClick={handleCopyLink} type="button">
                            {copied ? (
                                <><svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg> Copied!</>
                            ) : (
                                <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg> Copy Link</>
                            )}
                        </button>
                        <button className="btn-action" onClick={() => { setCompareMode(!compareMode); setCompareResults(null); }} type="button">{compareMode ? 'Hide Compare' : 'Compare Rates'}</button>
                    </div>
                </div>
            )}

            <InternalLinks currentPath="/inflation-calculator" />
            <section className="seo-content" id="seo">
                <h2>The Silent Wealth Killer: Understanding Inflation's Impact</h2>
                <p>Inflation is often described as a "silent tax." While it doesn't appear on your pay stub or bank statement, it is constantly eating away at the value of your money. Simply put, inflation is the rate at which the general level of prices for goods and services rises, and consequently, the purchasing power of your currency falls. If you don't account for inflation in your long-term financial planning, your future retirement lifestyle could be significantly leaner than you anticipate.</p>

                <h3>How Inflation is Measured: CPI and Beyond</h3>
                <p>Most governments track inflation using a <strong>Consumer Price Index (CPI)</strong>. This index monitors a "basket of goods" — including housing, food, energy, healthcare, and transportation — and tracks how the cost of that basket changes over time. While the official "headline" inflation might be 2% or 3%, your <strong>personal inflation rate</strong> might be much higher depending on your spending habits (for example, if you have high medical costs or spend a lot on gasoline).</p>

                <h3>The Economics of Rising Prices: Why Does Inflation Happen?</h3>
                <p>Economists generally categorize inflation into three types:</p>
                <ul>
                    <li><strong>Demand-Pull Inflation:</strong> This occurs when the demand for goods and services exceeds the economy's ability to produce them ("too much money chasing too few goods"). This often happens during periods of strong economic growth.</li>
                    <li><strong>Cost-Push Inflation:</strong> This happens when the costs of production (like wages or raw materials) increase, and companies pass those costs on to consumers in the form of higher prices.</li>
                    <li><strong>Built-In Inflation:</strong> This is tied to "inflationary expectations." If workers expect prices to rise, they demand higher wages, which causes companies to raise prices further, creating a self-reinforcing cycle.</li>
                </ul>

                <h3>Visualizing the Erosion of Purchasing Power</h3>
                <p>The most shocking aspect of inflation is how it compounds over decades. Even at a "moderate" inflation rate of 3%, the value of your money will be cut in half in just 24 years. This means that a $100 grocery bill today would cost $200 for the exact same items in about two decades. Our Inflation Calculator allows you to see this exact math for any dollar amount and time period, helping you understand why "saving" is not enough — you must <strong>invest</strong> to stay ahead.</p>

                <h3>Asset Classes That Hedge Against Inflation</h3>
                <p>To protect your wealth, you need to own assets that appreciate at a rate higher than inflation. Historically, these include:</p>
                <ul>
                    <li><strong>Equities (Stocks):</strong> Companies can often raise prices to match inflation, allowing their earnings (and stock prices) to keep pace over the long term.</li>
                    <li><strong>Real Estate:</strong> Property values and rents typically rise with inflation, making real estate a classic "hard asset" hedge.</li>
                    <li><strong>TIPS (Treasury Inflation-Protected Securities):</strong> These are government bonds specifically designed to increase in value based on changes in the CPI index.</li>
                    <li><strong>Commodities:</strong> Gold, oil, and agricultural products often rise in value when inflation spikes, though they can be highly volatile.</li>
                </ul>

                <h3>Historical Context: From Gold Standards to Hyperinflation</h3>
                <p>Throughout history, inflation has varied wildly. During the 1970s in the United States, inflation hit double digits (over 13%), causing massive economic disruption. In extreme cases, countries have experienced <strong>hyperinflation</strong> — such as Germany in the 1920s or Zimbabwe in the 2000s — where currency lost value so fast that prices changed by the hour. While these are extreme examples, they serve as a reminder of why monetary stability is a primary goal for central banks like the Federal Reserve.</p>

                <h3>How to Use This Calculator for Better Planning</h3>
                <ol>
                    <li><strong>Determine your future needs:</strong> Use the calculator to see how much a $5,000 monthly retirement budget today will cost in 20 years. This will help you set a more realistic savings goal.</li>
                    <li><strong>Audit your "safe" investments:</strong> If your savings account is earning 1% and inflation is 4%, you are effectively <strong>losing 3% of your wealth</strong> every year. Use this insight to decide if you need to take on more calculated risk in your portfolio.</li>
                    <li><strong>Adjust for salary negotiations:</strong> If you receive a 3% raise but inflation was 5% this year, you effectively took a 2% pay cut. Use inflation data as leverage during performance reviews.</li>
                </ol>
            </section>
            <FAQSection faqs={faqs} />

            <TryNextCalculator currentPath="/inflation-calculator" />
        </div>
    );
}
