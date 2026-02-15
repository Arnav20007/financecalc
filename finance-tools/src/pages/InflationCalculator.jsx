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
import { calculateInflation } from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';
import { generatePDF } from '../utils/pdfGenerator';
import { useValidatedInputs } from '../utils/useValidatedInput';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const faqs = [
    { question: 'What is inflation?', answer: 'Inflation is the rate at which the general level of prices for goods and services rises, causing purchasing power to fall.' },
    { question: 'How does inflation affect my savings?', answer: 'If your savings earn less interest than the inflation rate, your money loses purchasing power over time.' },
    { question: 'What has the historical inflation rate been?', answer: 'In the United States, inflation has averaged about 3.2% per year over the past century.' },
    { question: 'How can I protect my money from inflation?', answer: 'Treasury Inflation-Protected Securities (TIPS), real estate, stocks, and commodities are common inflation hedges.' },
    { question: 'What is the CPI?', answer: 'The Consumer Price Index (CPI) measures changes in the price level of a market basket of consumer goods and services.' },
    { question: 'How does inflation impact retirement planning?', answer: 'Inflation makes future expenses higher. If you plan to retire in 30 years, a $50,000 annual lifestyle could easily cost $120,000+.' },
];

const validationRules = {
    currentValue: { label: 'Current Value', min: 1, max: 100000000, required: true },
    years: { label: 'Time Period', min: 1, max: 100, allowDecimal: false, required: true },
    inflationRate: { label: 'Inflation Rate', min: 0, max: 30, allowDecimal: true, required: true },
};

export default function InflationCalculator() {
    const { values: inputs, errors, touched, handleChange, handleBlur, validateAll, getNumericValue } = useValidatedInputs(
        { currentValue: '100000', years: '25', inflationRate: '3' },
        validationRules
    );
    const [results, setResults] = useState(null);
    const [compareMode, setCompareMode] = useState(false);
    const [compareRate, setCompareRate] = useState('5');
    const [compareResults, setCompareResults] = useState(null);
    const resultsRef = useRef(null);

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
                <div className="form-grid">
                    <ValidatedInput name="currentValue" label="Current Value" hint="(USD)" value={inputs.currentValue} onChange={handleChange} onBlur={handleBlur} error={errors.currentValue} touched={touched.currentValue} prefix="$" min={1} step={1000} />
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
                    <AdSlot type="mid-content" />

                    <div className="actions-bar">
                        <button className="btn-action" onClick={handleDownloadPDF} type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7,10 12,15 17,10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>Download PDF</button>
                        <ShareButton title="Inflation Impact" text={`At ${inputs.inflationRate}% inflation, ${formatCurrency(getNumericValue('currentValue'))} today will need ${formatCurrency(results.futureValue)} in ${inputs.years} years!`} />
                        <button className="btn-action" onClick={() => { setCompareMode(!compareMode); setCompareResults(null); }} type="button">{compareMode ? 'Hide Compare' : 'Compare Rates'}</button>
                    </div>
                </div>
            )}

            <InternalLinks currentPath="/inflation-calculator" />
            <section className="seo-content">
                <h2>Understanding Inflation</h2>
                <p>Inflation is the rate at which the general level of prices for goods and services rises over time. It's one of the most important factors in long-term financial planning, yet it's often underestimated.</p>
                <h2>The Hidden Tax on Your Savings</h2>
                <p>Inflation acts like a silent tax on your cash holdings. Money sitting in a regular savings account earning 0.5% while inflation is 3% is actually losing 2.5% of its purchasing power every year.</p>
            </section>
            <FAQSection faqs={faqs} />
            <AdSlot type="multiplex" />
            <TryNextCalculator currentPath="/inflation-calculator" />
        </div>
    );
}
