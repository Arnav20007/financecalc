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
import { calculateLoanPayoff } from '../utils/calculations';
import { formatCurrency, formatMonthsToYears } from '../utils/formatters';
import { generatePDF } from '../utils/pdfGenerator';
import { useValidatedInputs } from '../utils/useValidatedInput';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

const faqs = [
    { question: 'What is an amortization schedule?', answer: 'An amortization schedule is a complete table of periodic loan payments showing the amount of principal and interest that comprise each payment until the loan is paid off at the end of its term.' },
    { question: 'How is loan interest calculated?', answer: 'Most loans use simple interest on the remaining balance. Each month, the interest charge equals the outstanding balance multiplied by the monthly interest rate (annual rate ÷ 12).' },
    { question: 'Should I make extra payments on my loan?', answer: 'Making extra payments can significantly reduce the total interest paid and the loan duration. Even small additional amounts applied to principal each month can save thousands over the life of a loan.' },
    { question: 'What is the difference between APR and interest rate?', answer: 'The interest rate is the cost of borrowing the principal amount. The APR includes the interest rate plus other costs like origination fees, closing costs, and insurance.' },
    { question: 'How do I calculate my minimum monthly payment?', answer: 'For a standard amortizing loan, the minimum payment is calculated using the formula: M = P[r(1+r)^n]/[(1+r)^n-1], where P is the principal, r is the monthly interest rate, and n is the number of payments.' },
    { question: 'Is this calculator suitable for mortgage calculations?', answer: 'Yes, this calculator works for any fixed-rate amortizing loan including mortgages, auto loans, personal loans, and student loans.' },
];

const validationRules = {
    amount: { label: 'Loan Amount', min: 1, max: 100000000, required: true },
    rate: { label: 'Interest Rate', min: 0.1, max: 50, allowDecimal: true, required: true },
    payment: { label: 'Monthly Payment', min: 1, max: 10000000, required: true },
};

export default function LoanPayoffCalculator() {
    const { values: inputs, errors, touched, handleChange, handleBlur, validateAll, getNumericValue } = useValidatedInputs(
        { amount: '250000', rate: '6.5', payment: '2000' },
        validationRules
    );
    const [results, setResults] = useState(null);
    const [calcError, setCalcError] = useState('');
    const resultsRef = useRef(null);

    const handleCalculate = (e) => {
        e.preventDefault();
        setCalcError('');
        if (!validateAll()) return;
        const result = calculateLoanPayoff(getNumericValue('amount'), getNumericValue('rate'), getNumericValue('payment'));
        if (result.error) { setCalcError(result.error); setResults(null); return; }
        setResults(result);
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    };

    const handleDownloadPDF = () => {
        if (!results) return;
        generatePDF('Loan Payoff Schedule', [
            { label: 'Loan Amount', value: formatCurrency(getNumericValue('amount')) },
            { label: 'Interest Rate', value: `${inputs.rate}%` },
            { label: 'Monthly Payment', value: formatCurrency(getNumericValue('payment')) },
            { label: 'Payoff Time', value: formatMonthsToYears(results.totalMonths) },
            { label: 'Total Interest Paid', value: formatCurrency(results.totalInterest) },
            { label: 'Total Amount Paid', value: formatCurrency(results.totalPayments) },
        ], results.annualSummary, [
            { header: 'Year', accessor: r => r.year },
            { header: 'Payments', accessor: r => formatCurrency(r.totalPayments) },
            { header: 'Principal', accessor: r => formatCurrency(r.totalPrincipal) },
            { header: 'Interest', accessor: r => formatCurrency(r.totalInterest) },
            { header: 'Remaining', accessor: r => formatCurrency(r.endBalance) },
        ]);
    };

    const chartOptions = {
        responsive: true, maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top', labels: { color: '#94a3b8', padding: 16, usePointStyle: true } },
            tooltip: {
                backgroundColor: 'rgba(15, 22, 41, 0.95)', titleColor: '#f1f5f9', bodyColor: '#94a3b8',
                borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, padding: 12, cornerRadius: 8,
                callbacks: { label: ctx => `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}` },
            },
        },
        scales: {
            y: { ticks: { callback: v => formatCurrency(v), color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' }, border: { color: 'transparent' } },
            x: { grid: { display: false }, ticks: { color: '#64748b' }, border: { color: 'transparent' } },
        },
    };

    const lineChartData = results ? {
        labels: results.annualSummary.map(r => `Year ${r.year}`),
        datasets: [{
            label: 'Remaining Balance', data: results.annualSummary.map(r => r.endBalance),
            borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.08)',
            fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#ef4444',
        }],
    } : null;

    const doughnutData = results ? {
        labels: ['Principal', 'Total Interest'],
        datasets: [{
            data: [getNumericValue('amount'), results.totalInterest],
            backgroundColor: ['rgba(59, 130, 246, 0.6)', 'rgba(249, 115, 22, 0.6)'],
            borderColor: ['rgba(59, 130, 246, 0.9)', 'rgba(249, 115, 22, 0.9)'],
            borderWidth: 2,
        }],
    } : null;

    return (
        <div className="calculator-page">
            <SEOHead title="Loan Payoff Calculator — Free Amortization Schedule Tool" description="Calculate your loan payoff timeline with a complete amortization schedule." canonical="/loan-payoff-calculator" faqSchema={faqs} />
            <nav className="breadcrumbs"><Link to="/">Home</Link><span>/</span><span>Loan Payoff Calculator</span></nav>

            <section className="calculator-hero">
                <h1>Loan Payoff Calculator</h1>
                <p className="hero-subtitle">See your complete amortization schedule, total interest costs, and payoff timeline for any fixed-rate loan.</p>
            </section>

            <form className="calculator-form" onSubmit={handleCalculate} id="loan-payoff-form" noValidate>
                <div className="form-grid">
                    <ValidatedInput name="amount" label="Loan Amount" hint="(USD)" value={inputs.amount} onChange={handleChange} onBlur={handleBlur} error={errors.amount} touched={touched.amount} prefix="$" min={1} step={1000} />
                    <ValidatedInput name="rate" label="Annual Interest Rate" hint="(%)" value={inputs.rate} onChange={handleChange} onBlur={handleBlur} error={errors.rate} touched={touched.rate} suffix="%" min={0.1} max={50} step={0.1} />
                    <ValidatedInput name="payment" label="Monthly Payment" hint="(USD)" value={inputs.payment} onChange={handleChange} onBlur={handleBlur} error={errors.payment} touched={touched.payment} prefix="$" min={1} step={50} className="full-width" />
                </div>
                {calcError && <p style={{ color: 'var(--color-error)', marginTop: '0.75rem', fontSize: '0.875rem', padding: '0.75rem', background: 'rgba(239,68,68,0.08)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>{calcError}</p>}
                <button type="submit" className="btn-calculate" id="calculate-loan-payoff" style={{ marginTop: '1.25rem' }}>Calculate Loan Payoff</button>
                <PrivacyBadge />
            </form>

            {results && (
                <div className="results-section" ref={resultsRef}>
                    <div className="results-summary">
                        <div className="result-card highlight"><div className="result-label">Payoff Time</div><div className="result-value small">{formatMonthsToYears(results.totalMonths)}</div></div>
                        <div className="result-card"><div className="result-label">Total Payments</div><div className="result-value small">{formatCurrency(results.totalPayments)}</div></div>
                        <div className="result-card" style={{ borderColor: 'rgba(249, 115, 22, 0.3)' }}><div className="result-label">Total Interest Paid</div><div className="result-value small" style={{ color: '#f97316' }}>{formatCurrency(results.totalInterest)}</div></div>
                    </div>

                    <div className="chart-section"><h3>Balance Over Time</h3><div className="chart-container"><Line data={lineChartData} options={chartOptions} /></div></div>
                    <div className="chart-section"><h3>Principal vs Interest</h3><div style={{ maxWidth: 300, margin: '0 auto' }}>
                        <Doughnut data={doughnutData} options={{ responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } }, tooltip: { backgroundColor: 'rgba(15,22,41,0.95)', titleColor: '#f1f5f9', bodyColor: '#94a3b8', callbacks: { label: ctx => `${ctx.label}: ${formatCurrency(ctx.raw)}` } } } }} />
                    </div></div>

                    <AdSlot type="mid-content" />

                    <div className="data-table-wrapper">
                        <div className="data-table-header"><h3>Annual Amortization Summary</h3></div>
                        <div className="data-table-scroll">
                            <table className="data-table">
                                <thead><tr><th>Year</th><th>Payments</th><th>Principal Paid</th><th>Interest Paid</th><th>Remaining Balance</th></tr></thead>
                                <tbody>{results.annualSummary.map(row => (
                                    <tr key={row.year}><td>{row.year}</td><td>{formatCurrency(row.totalPayments)}</td><td style={{ color: '#3b82f6' }}>{formatCurrency(row.totalPrincipal)}</td><td style={{ color: '#f97316' }}>{formatCurrency(row.totalInterest)}</td><td><strong>{formatCurrency(row.endBalance)}</strong></td></tr>
                                ))}</tbody>
                            </table>
                        </div>
                    </div>

                    <div className="actions-bar">
                        <button className="btn-action" onClick={handleDownloadPDF} type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7,10 12,15 17,10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>Download PDF</button>
                        <ShareButton title="Loan Payoff Results" text={`My ${formatCurrency(getNumericValue('amount'))} loan at ${inputs.rate}% will be paid off in ${formatMonthsToYears(results.totalMonths)}.`} />
                    </div>
                </div>
            )}

            <InternalLinks currentPath="/loan-payoff-calculator" />
            <section className="seo-content">
                <h2>Understanding Loan Amortization</h2>
                <p>When you take out a fixed-rate loan, your monthly payment stays the same throughout the life of the loan, but the way that payment is divided between principal and interest changes dramatically over time.</p>
                <h2>How Extra Payments Save You Money</h2>
                <p>Even small extra payments applied directly to principal can have a dramatic effect on your loan. Consider a $300,000 mortgage at 6.5% for 30 years: adding just $200 extra per month to principal would save you approximately $94,000 in interest.</p>
                <h2>Strategies for Faster Loan Payoff</h2>
                <ul>
                    <li><strong>Bi-weekly payments:</strong> Making half your monthly payment every two weeks results in 13 full payments per year instead of 12.</li>
                    <li><strong>Round up payments:</strong> If your payment is $1,843, rounding up to $1,900 puts an extra $57 toward principal each month.</li>
                    <li><strong>Apply windfalls:</strong> Tax refunds, bonuses, and inheritances applied to principal can significantly reduce your loan term.</li>
                    <li><strong>Refinance strategically:</strong> If rates drop significantly below your current rate, refinancing can reduce both your payment and total interest.</li>
                </ul>
            </section>
            <FAQSection faqs={faqs} />
            <AdSlot type="multiplex" />
            <TryNextCalculator currentPath="/loan-payoff-calculator" />
        </div>
    );
}
