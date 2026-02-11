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
import { calculateLoanPayoff } from '../utils/calculations';
import { formatCurrency, formatMonthsToYears } from '../utils/formatters';
import { generatePDF } from '../utils/pdfGenerator';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

const faqs = [
    { question: 'What is an amortization schedule?', answer: 'An amortization schedule is a complete table of periodic loan payments showing the amount of principal and interest that comprise each payment until the loan is paid off at the end of its term. Each payment is the same total amount, but early payments are mostly interest while later payments are mostly principal.' },
    { question: 'How is loan interest calculated?', answer: 'Most loans use simple interest on the remaining balance. Each month, the interest charge equals the outstanding balance multiplied by the monthly interest rate (annual rate ÷ 12). The remainder of your payment goes toward reducing the principal balance.' },
    { question: 'Should I make extra payments on my loan?', answer: 'Making extra payments can significantly reduce the total interest paid and the loan duration. Even small additional amounts applied to principal each month can save thousands over the life of a loan. However, check for prepayment penalties first, and ensure you have an adequate emergency fund before making extra payments.' },
    { question: 'What is the difference between APR and interest rate?', answer: 'The interest rate is the cost of borrowing the principal amount. The APR (Annual Percentage Rate) includes the interest rate plus other costs like origination fees, closing costs, and insurance, giving you a more complete picture of the total borrowing cost. APR is typically higher than the stated interest rate.' },
    { question: 'How do I calculate my minimum monthly payment?', answer: 'For a standard amortizing loan, the minimum payment is calculated using the formula: M = P[r(1+r)^n]/[(1+r)^n-1], where P is the principal, r is the monthly interest rate, and n is the number of payments. Our calculator works in reverse — you enter your payment amount and it shows you the payoff timeline.' },
    { question: 'Is this calculator suitable for mortgage calculations?', answer: 'Yes, this calculator works for any fixed-rate amortizing loan including mortgages, auto loans, personal loans, and student loans. For adjustable-rate mortgages (ARMs), the results would only be accurate for the initial fixed-rate period.' },
];

export default function LoanPayoffCalculator() {
    const [inputs, setInputs] = useState({ amount: 250000, rate: 6.5, payment: 2000 });
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');
    const resultsRef = useRef(null);

    const handleCalculate = (e) => {
        e.preventDefault();
        setError('');
        const result = calculateLoanPayoff(
            parseFloat(inputs.amount), parseFloat(inputs.rate), parseFloat(inputs.payment)
        );
        if (result.error) {
            setError(result.error);
            setResults(null);
            return;
        }
        setResults(result);
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    };

    const handleChange = (e) => setInputs({ ...inputs, [e.target.name]: e.target.value });

    const handleDownloadPDF = () => {
        if (!results) return;
        generatePDF('Loan Payoff Schedule', [
            { label: 'Loan Amount', value: formatCurrency(inputs.amount) },
            { label: 'Interest Rate', value: `${inputs.rate}%` },
            { label: 'Monthly Payment', value: formatCurrency(inputs.payment) },
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

    const lineChartData = results ? {
        labels: results.annualSummary.map(r => `Year ${r.year}`),
        datasets: [
            {
                label: 'Remaining Balance',
                data: results.annualSummary.map(r => r.endBalance),
                borderColor: '#dc2626',
                backgroundColor: 'rgba(220, 38, 38, 0.05)',
                fill: true, tension: 0.3, pointRadius: 4,
            },
        ],
    } : null;

    const doughnutData = results ? {
        labels: ['Principal', 'Total Interest'],
        datasets: [{
            data: [parseFloat(inputs.amount), results.totalInterest],
            backgroundColor: ['#2563eb', '#f97316'],
            borderColor: ['#fff', '#fff'],
            borderWidth: 3,
        }],
    } : null;

    const stackedData = results ? {
        labels: results.annualSummary.map(r => `Year ${r.year}`),
        datasets: [
            {
                label: 'Principal Paid',
                data: results.annualSummary.map(r => r.totalPrincipal),
                backgroundColor: '#2563eb',
            },
            {
                label: 'Interest Paid',
                data: results.annualSummary.map(r => r.totalInterest),
                backgroundColor: '#f97316',
            },
        ],
    } : null;

    return (
        <div className="calculator-page">
            <SEOHead
                title="Loan Payoff Calculator — Free Amortization Schedule Tool"
                description="Calculate your loan payoff timeline with a complete amortization schedule. See total interest paid, monthly breakdowns, and payoff projections for mortgages, auto loans, and more."
                canonical="/loan-payoff-calculator"
                faqSchema={faqs}
            />

            <nav className="breadcrumbs">
                <Link to="/">Home</Link><span>/</span><span>Loan Payoff Calculator</span>
            </nav>

            <section className="calculator-hero">
                <h1>Loan Payoff Calculator</h1>
                <p className="hero-subtitle">
                    See your complete amortization schedule, total interest costs, and payoff timeline for any fixed-rate loan.
                </p>
            </section>

            <form className="calculator-form" onSubmit={handleCalculate} id="loan-payoff-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="amount">Loan Amount <span className="label-hint">(USD)</span></label>
                        <input id="amount" name="amount" type="number" className="form-input" value={inputs.amount} onChange={handleChange} min="1" step="1000" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="rate">Annual Interest Rate <span className="label-hint">(%)</span></label>
                        <input id="rate" name="rate" type="number" className="form-input" value={inputs.rate} onChange={handleChange} min="0.1" max="50" step="0.1" required />
                    </div>
                    <div className="form-group full-width">
                        <label htmlFor="payment">Monthly Payment <span className="label-hint">(USD)</span></label>
                        <input id="payment" name="payment" type="number" className="form-input" value={inputs.payment} onChange={handleChange} min="1" step="50" required />
                    </div>
                </div>
                {error && <p style={{ color: 'var(--color-error)', marginTop: '0.75rem', fontSize: '0.875rem' }}>{error}</p>}
                <button type="submit" className="btn-calculate" id="calculate-loan-payoff" style={{ marginTop: '1.25rem' }}>
                    Calculate Loan Payoff
                </button>
            </form>

            {results && (
                <div className="results-section" ref={resultsRef}>
                    <div className="results-summary">
                        <div className="result-card highlight">
                            <div className="result-label">Payoff Time</div>
                            <div className="result-value small">{formatMonthsToYears(results.totalMonths)}</div>
                        </div>
                        <div className="result-card">
                            <div className="result-label">Total Payments</div>
                            <div className="result-value small">{formatCurrency(results.totalPayments)}</div>
                        </div>
                        <div className="result-card" style={{ borderColor: '#f97316' }}>
                            <div className="result-label">Total Interest Paid</div>
                            <div className="result-value small" style={{ color: '#f97316' }}>{formatCurrency(results.totalInterest)}</div>
                        </div>
                    </div>

                    <div className="chart-section">
                        <h3>Balance Over Time</h3>
                        <div className="chart-container">
                            <Line data={lineChartData} options={{
                                responsive: true, maintainAspectRatio: false,
                                plugins: { legend: { position: 'top' }, tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}` } } },
                                scales: { y: { ticks: { callback: v => formatCurrency(v) }, grid: { color: 'rgba(0,0,0,0.04)' } }, x: { grid: { display: false } } },
                            }} />
                        </div>
                    </div>

                    <div className="chart-section">
                        <h3>Principal vs Interest</h3>
                        <div style={{ maxWidth: 300, margin: '0 auto' }}>
                            <Doughnut data={doughnutData} options={{
                                responsive: true, plugins: { legend: { position: 'bottom' }, tooltip: { callbacks: { label: ctx => `${ctx.label}: ${formatCurrency(ctx.raw)}` } } },
                            }} />
                        </div>
                    </div>

                    <AdSlot type="mid-content" />

                    <div className="data-table-wrapper">
                        <div className="data-table-header"><h3>Annual Amortization Summary</h3></div>
                        <div className="data-table-scroll">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Year</th>
                                        <th>Payments</th>
                                        <th>Principal Paid</th>
                                        <th>Interest Paid</th>
                                        <th>Remaining Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.annualSummary.map(row => (
                                        <tr key={row.year}>
                                            <td>{row.year}</td>
                                            <td>{formatCurrency(row.totalPayments)}</td>
                                            <td style={{ color: '#2563eb' }}>{formatCurrency(row.totalPrincipal)}</td>
                                            <td style={{ color: '#f97316' }}>{formatCurrency(row.totalInterest)}</td>
                                            <td><strong>{formatCurrency(row.endBalance)}</strong></td>
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
                        <ShareButton title="Loan Payoff Results" text={`My ${formatCurrency(inputs.amount)} loan at ${inputs.rate}% will be paid off in ${formatMonthsToYears(results.totalMonths)} with ${formatCurrency(results.totalInterest)} in interest.`} />
                    </div>
                </div>
            )}

            <InternalLinks currentPath="/loan-payoff-calculator" />

            <section className="seo-content">
                <h2>Understanding Loan Amortization</h2>
                <p>
                    When you take out a fixed-rate loan, your monthly payment stays the same throughout the life of the loan, but the way that payment is divided between principal and interest changes dramatically over time. In the early years of a mortgage, for instance, the vast majority of each payment goes toward interest. As the principal balance decreases, more of each payment goes toward paying down the actual loan amount.
                </p>
                <p>
                    This is why an amortization schedule is so valuable — it shows you exactly where your money goes each month. Understanding this breakdown can motivate you to make extra principal payments, which can save you tens of thousands of dollars in interest over the life of a typical mortgage.
                </p>

                <h2>How Extra Payments Save You Money</h2>
                <p>
                    Even small extra payments applied directly to principal can have a dramatic effect on your loan. Consider a $300,000 mortgage at 6.5% for 30 years: the standard monthly payment would be about $1,896. Adding just $200 extra per month to principal would save you approximately $94,000 in interest and pay off the loan over 6 years earlier.
                </p>
                <p>
                    You can use this calculator to experiment with different monthly payment amounts. Try increasing your payment by $100, $200, or $500 to see how it affects your total interest paid and payoff timeline. The results may surprise you — the impact of extra payments is far greater than most people expect.
                </p>

                <h2>Fixed-Rate vs. Variable-Rate Loans</h2>
                <p>
                    This calculator is designed for fixed-rate loans where the interest rate remains constant throughout the loan term. Common fixed-rate loans include conventional mortgages, auto loans, and personal loans. Variable-rate loans (like adjustable-rate mortgages or some student loans) have interest rates that change periodically, making amortization calculations more complex.
                </p>
                <p>
                    If you have a variable-rate loan, you can still use this calculator by entering your current interest rate. The results will be accurate as long as the rate doesn't change. For long-term planning with variable rates, consider running the calculator with multiple different rates to see best-case and worst-case scenarios.
                </p>

                <h2>Mortgage Considerations</h2>
                <p>
                    For homeowners, understanding your mortgage amortization is crucial for making informed financial decisions. Your mortgage is likely the largest debt you'll ever carry, and the total interest paid over 30 years can exceed the original loan amount. By understanding the amortization schedule, you can identify the optimal points for refinancing and determine whether extra payments or investing the difference would be more beneficial.
                </p>
                <p>
                    Keep in mind that your actual monthly housing payment includes more than just principal and interest. Property taxes, homeowner's insurance, and possibly private mortgage insurance (PMI) are typically included in your monthly payment but are not part of the amortization calculation. This calculator focuses on the loan itself — principal and interest only.
                </p>

                <h2>Strategies for Faster Loan Payoff</h2>
                <ul>
                    <li><strong>Bi-weekly payments:</strong> Making half your monthly payment every two weeks results in 26 half-payments (13 full payments) per year instead of 12, accelerating your payoff.</li>
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
