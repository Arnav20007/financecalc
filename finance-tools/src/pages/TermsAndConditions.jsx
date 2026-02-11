import { Link } from 'react-router-dom';
import SEOHead from '../components/common/SEOHead';

export default function TermsAndConditions() {
    return (
        <div className="legal-page">
            <SEOHead
                title="Terms and Conditions"
                description="FinanceCalc terms and conditions. Read our terms of service governing your use of our financial calculator tools and website."
                canonical="/terms-and-conditions"
            />

            <nav className="breadcrumbs">
                <Link to="/">Home</Link><span>/</span><span>Terms and Conditions</span>
            </nav>

            <h1>Terms and Conditions</h1>
            <p className="last-updated">Last Updated: February 11, 2026</p>

            <p>
                Please read these Terms and Conditions ("Terms") carefully before using the FinanceCalc
                website at financecalc.com (the "Service") operated by FinanceCalc ("us," "we," or "our").
            </p>

            <h2>1. Acceptance of Terms</h2>
            <p>By accessing or using the Service, you agree to be bound by these Terms. If you disagree
                with any part of the terms, then you may not access the Service. These Terms apply to all
                visitors, users, and others who access or use the Service.</p>

            <h2>2. Description of Service</h2>
            <p>FinanceCalc provides free online financial calculators and tools for educational and
                informational purposes. Our tools include compound interest calculators, loan payoff calculators,
                retirement planners, inflation calculators, and debt payoff strategy tools. All calculations are
                performed locally in your browser.</p>

            <h2>3. No Financial Advice</h2>
            <p><strong>THE SERVICE DOES NOT PROVIDE FINANCIAL, INVESTMENT, TAX, OR LEGAL ADVICE.</strong>
                The calculators and content provided on this website are for general informational and educational
                purposes only. They are not intended to be and should not be considered as professional financial
                advice. Always consult with qualified financial professionals before making any financial decisions.</p>

            <h2>4. Accuracy of Calculations</h2>
            <p>While we strive to ensure the accuracy of our calculators, we make no warranties or
                representations regarding the accuracy, completeness, or reliability of any calculations,
                results, or content provided through the Service. Calculations are estimates based on the
                inputs you provide and assumptions built into the tools. Actual financial outcomes may differ
                significantly from calculated projections.</p>

            <h2>5. User Responsibilities</h2>
            <p>You are responsible for:</p>
            <ul>
                <li>Verifying the accuracy of any inputs you provide to our calculators</li>
                <li>Understanding that results are estimates and not guarantees</li>
                <li>Seeking professional financial advice before making financial decisions</li>
                <li>Complying with all applicable laws and regulations in your jurisdiction</li>
                <li>Using the Service in a manner that does not disrupt or interfere with the Service</li>
            </ul>

            <h2>6. Intellectual Property</h2>
            <p>The Service and its original content, features, and functionality are and will remain the
                exclusive property of FinanceCalc. The Service is protected by copyright, trademark, and other
                laws. Our trademarks may not be used in connection with any product or service without our
                prior written consent.</p>

            <h2>7. Prohibited Uses</h2>
            <p>You may not use the Service:</p>
            <ul>
                <li>For any unlawful purpose or in violation of any laws</li>
                <li>To impersonate any person or entity</li>
                <li>To interfere with or disrupt the Service or servers</li>
                <li>To attempt to gain unauthorized access to any portion of the Service</li>
                <li>To scrape, mine, or collect data from the Service without our express permission</li>
                <li>To use the results to provide professional financial advice to others without appropriate licensing</li>
            </ul>

            <h2>8. Third-Party Links and Content</h2>
            <p>Our Service may contain links to third-party web sites or services that are not owned or
                controlled by FinanceCalc. We have no control over and assume no responsibility for the content,
                privacy policies, or practices of any third-party web sites or services. We do not warrant the
                offerings of any of these entities or their websites.</p>

            <h2>9. Advertising</h2>
            <p>The Service may display advertisements provided by third-party advertising networks,
                including Google AdSense. These advertisements may use cookies and similar technologies to
                serve ads based on your interests. We are not responsible for the content of third-party
                advertisements.</p>

            <h2>10. Limitation of Liability</h2>
            <p>IN NO EVENT SHALL FINANCECALC, ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR
                AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
                INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES,
                RESULTING FROM YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICE.</p>

            <h2>11. Disclaimer of Warranties</h2>
            <p>THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT ANY WARRANTIES OF
                ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF
                MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR COURSE OF PERFORMANCE.</p>

            <h2>12. Indemnification</h2>
            <p>You agree to defend, indemnify, and hold harmless FinanceCalc and its licensees, licensors,
                and their employees, contractors, agents, officers, and directors from and against any and all
                claims, damages, obligations, losses, liabilities, costs, or debt arising from your use of the Service.</p>

            <h2>13. Governing Law</h2>
            <p>These Terms shall be governed and construed in accordance with the laws of the United States,
                without regard to its conflict of law provisions. Our failure to enforce any right or provision
                of these Terms will not be considered a waiver of those rights.</p>

            <h2>14. Changes to Terms</h2>
            <p>We reserve the right to modify or replace these Terms at any time. If a revision is material,
                we will provide notice prior to any new terms taking effect. By continuing to access or use our
                Service after those revisions become effective, you agree to be bound by the revised terms.</p>

            <h2>15. Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us at:</p>
            <p><strong>Email:</strong> legal@financecalc.com</p>
            <p><strong>Website:</strong> <Link to="/">financecalc.com</Link></p>
        </div>
    );
}
