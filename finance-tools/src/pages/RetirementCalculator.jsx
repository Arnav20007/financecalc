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
import { calculateRetirement } from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';
import { generatePDF } from '../utils/pdfGenerator';
import { useValidatedInputs } from '../utils/useValidatedInput';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

const faqs = [
    { question: 'How much do I need to retire?', answer: 'A common guideline is to have 25 times your annual expenses saved by retirement (based on the 4% withdrawal rule).' },
    { question: 'What is the 4% rule?', answer: 'The 4% rule suggests that you can withdraw 4% of your retirement portfolio in the first year, then adjust that amount for inflation each subsequent year, and your money should last at least 30 years.' },
    { question: 'When should I start saving for retirement?', answer: 'The best time to start saving for retirement is as early as possible. Thanks to compound interest, money invested in your 20s has significantly more time to grow.' },
    { question: 'What rate of return should I assume?', answer: 'For a diversified portfolio of stocks and bonds, a reasonable long-term assumption is 6-8% annually before inflation.' },
    { question: 'How does Social Security factor in?', answer: 'Social Security benefits can provide a significant base of retirement income. Our calculator focuses on personal savings — consider Social Security as additional income.' },
    { question: 'Should I use a Roth IRA or Traditional IRA?', answer: 'The choice depends on your current vs. expected future tax bracket. If you expect to be in a higher bracket in retirement, Roth is better.' },
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
    const { values: inputs, errors, touched, handleChange, handleBlur, validateAll, getNumericValue } = useValidatedInputs(
        { currentAge: '30', retirementAge: '65', currentSavings: '50000', monthlyContribution: '1000', expectedReturn: '7', withdrawalRate: '4' },
        validationRules
    );
    const [results, setResults] = useState(null);
    const [calcError, setCalcError] = useState('');
    const resultsRef = useRef(null);

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
                <div className="form-grid">
                    <ValidatedInput name="currentAge" label="Current Age" value={inputs.currentAge} onChange={handleChange} onBlur={handleBlur} error={errors.currentAge} touched={touched.currentAge} suffix="yrs" min={18} max={80} />
                    <ValidatedInput name="retirementAge" label="Retirement Age" value={inputs.retirementAge} onChange={handleChange} onBlur={handleBlur} error={errors.retirementAge} touched={touched.retirementAge} suffix="yrs" min={30} max={100} />
                    <ValidatedInput name="currentSavings" label="Current Savings" hint="(USD)" value={inputs.currentSavings} onChange={handleChange} onBlur={handleBlur} error={errors.currentSavings} touched={touched.currentSavings} prefix="$" min={0} step={1000} />
                    <ValidatedInput name="monthlyContribution" label="Monthly Contribution" hint="(USD)" value={inputs.monthlyContribution} onChange={handleChange} onBlur={handleBlur} error={errors.monthlyContribution} touched={touched.monthlyContribution} prefix="$" min={0} step={50} />
                    <ValidatedInput name="expectedReturn" label="Expected Annual Return" hint="(%)" value={inputs.expectedReturn} onChange={handleChange} onBlur={handleBlur} error={errors.expectedReturn} touched={touched.expectedReturn} suffix="%" min={0} max={30} step={0.1} />
                    <ValidatedInput name="withdrawalRate" label="Safe Withdrawal Rate" hint="(%)" value={inputs.withdrawalRate} onChange={handleChange} onBlur={handleBlur} error={errors.withdrawalRate} touched={touched.withdrawalRate} suffix="%" min={1} max={10} step={0.1} />
                </div>
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

                    <AdSlot type="mid-content" />

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
                    </div>
                </div>
            )}

            <InternalLinks currentPath="/retirement-calculator" />
            <section className="seo-content">
                <h2>How Much Do You Need to Retire?</h2>
                <p>The most widely cited rule of thumb is the "25x rule" — save 25 times your expected annual expenses in retirement.</p>
                <h2>The Impact of Starting Early</h2>
                <p>When it comes to retirement savings, time is your greatest asset. Even small amounts invested early can grow to substantial sums.</p>
                <h2>Retirement Account Types</h2>
                <ul>
                    <li><strong>401(k) / 403(b):</strong> Employer-sponsored plans with high contribution limits. Many employers offer matching contributions.</li>
                    <li><strong>Traditional IRA:</strong> Tax-deductible contributions that grow tax-deferred.</li>
                    <li><strong>Roth IRA:</strong> After-tax contributions that grow and can be withdrawn completely tax-free.</li>
                </ul>
            </section>
            <FAQSection faqs={faqs} />
            <AdSlot type="multiplex" />
            <TryNextCalculator currentPath="/retirement-calculator" />
        </div>
    );
}
