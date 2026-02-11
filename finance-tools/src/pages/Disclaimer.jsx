import { Link } from 'react-router-dom';
import SEOHead from '../components/common/SEOHead';

export default function Disclaimer() {
    return (
        <div className="legal-page">
            <SEOHead
                title="Financial Disclaimer"
                description="FinanceCalc financial disclaimer. Important information about the limitations of our financial calculators and tools."
                canonical="/disclaimer"
            />

            <nav className="breadcrumbs">
                <Link to="/">Home</Link><span>/</span><span>Financial Disclaimer</span>
            </nav>

            <h1>Financial Disclaimer</h1>
            <p className="last-updated">Last Updated: February 11, 2026</p>

            <div style={{
                background: 'var(--color-warning-light)',
                border: '1px solid var(--color-warning)',
                borderRadius: 'var(--border-radius-lg)',
                padding: '1.5rem',
                marginBottom: '2rem',
            }}>
                <p style={{ fontWeight: 600, color: 'var(--color-warning)', marginBottom: '0.5rem', fontSize: '1rem' }}>
                    ⚠️ Important: This Is Not Financial Advice
                </p>
                <p style={{ color: 'var(--color-gray-700)', marginBottom: 0 }}>
                    The information and tools provided on FinanceCalc are for general educational and
                    informational purposes only. Nothing on this website constitutes professional financial,
                    investment, tax, legal, or accounting advice.
                </p>
            </div>

            <h2>1. General Information Only</h2>
            <p>All calculators, articles, guides, and other content on FinanceCalc are provided for
                general informational purposes only. The information is not intended to serve as financial
                advice. You should not act upon any information provided on this website without seeking
                professional advice from a qualified financial advisor who can take your specific circumstances
                into account.</p>

            <h2>2. No Professional Relationship</h2>
            <p>Your use of FinanceCalc does not create a client-advisor, fiduciary, or professional
                relationship between you and FinanceCalc or its owners, employees, or contributors. We do
                not hold ourselves out as financial advisors, certified financial planners, investment advisors,
                or tax professionals.</p>

            <h2>3. Accuracy of Calculator Results</h2>
            <p>While we make every effort to ensure our calculators are accurate, the results they produce
                are estimates based on simplifying assumptions. Actual financial outcomes will differ from
                calculated projections due to factors including but not limited to:</p>
            <ul>
                <li>Variable interest rates and market fluctuations</li>
                <li>Changes in tax laws and regulations</li>
                <li>Fees, commissions, and transaction costs not accounted for</li>
                <li>Inflation variability</li>
                <li>Changes in personal circumstances</li>
                <li>Rounding and computational limitations</li>
                <li>Differences in compounding methods used by financial institutions</li>
            </ul>

            <h2>4. Investment Risk</h2>
            <p>All investments carry risk. Past performance does not guarantee future results. The value
                of investments can go down as well as up, and you may get back less than you originally invested.
                Our calculators may show hypothetical growth scenarios that assume positive returns; actual market
                conditions may result in losses.</p>

            <h2>5. Tax and Legal Considerations</h2>
            <p>Our calculators do not account for all tax implications. Tax laws are complex and subject to
                change. The tax treatment of financial products varies by jurisdiction, and your personal tax
                situation may differ significantly from the general assumptions used in our tools. Always consult
                a qualified tax professional for advice specific to your situation.</p>

            <h2>6. Third-Party Information</h2>
            <p>FinanceCalc may reference or link to information from third-party sources. We do not control
                and are not responsible for the accuracy, reliability, or completeness of information provided by
                third parties. The inclusion of links to other websites does not imply endorsement of those sites.</p>

            <h2>7. Limitation of Liability</h2>
            <p>FINANCECALC SHALL NOT BE LIABLE FOR ANY DAMAGES ARISING FROM THE USE OF THIS WEBSITE OR
                ITS CALCULATORS, INCLUDING BUT NOT LIMITED TO DIRECT, INDIRECT, INCIDENTAL, PUNITIVE, AND
                CONSEQUENTIAL DAMAGES. THIS LIMITATION APPLIES WHETHER THE ALLEGED LIABILITY IS BASED ON
                CONTRACT, TORT, NEGLIGENCE, STRICT LIABILITY, OR ANY OTHER BASIS.</p>

            <h2>8. Consult a Professional</h2>
            <p>Before making any financial decisions, we strongly recommend that you:</p>
            <ul>
                <li>Consult with a certified financial planner (CFP) or registered investment advisor (RIA)</li>
                <li>Consult with a qualified tax professional regarding tax implications</li>
                <li>Consult with an attorney regarding any legal questions</li>
                <li>Review the specific terms and conditions of any financial product you are considering</li>
                <li>Consider your complete financial situation, goals, and risk tolerance</li>
            </ul>

            <h2>9. Updates to This Disclaimer</h2>
            <p>We may update this disclaimer from time to time. Any changes will be posted on this page
                with an updated revision date. Your continued use of the Service after such modifications
                constitutes your acknowledgment and acceptance of the updated disclaimer.</p>

            <h2>10. Contact</h2>
            <p>If you have any questions about this disclaimer, please contact us at:</p>
            <p><strong>Email:</strong> legal@financecalc.com</p>
            <p><strong>Website:</strong> <Link to="/">financecalc.com</Link></p>
        </div>
    );
}
