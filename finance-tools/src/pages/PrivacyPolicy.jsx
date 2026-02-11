import { Link } from 'react-router-dom';
import SEOHead from '../components/common/SEOHead';

export default function PrivacyPolicy() {
    return (
        <div className="legal-page">
            <SEOHead
                title="Privacy Policy"
                description="FinanceCalc privacy policy. Learn how we collect, use, and protect your data when you use our financial calculator tools."
                canonical="/privacy-policy"
            />

            <nav className="breadcrumbs">
                <Link to="/">Home</Link><span>/</span><span>Privacy Policy</span>
            </nav>

            <h1>Privacy Policy</h1>
            <p className="last-updated">Last Updated: February 11, 2026</p>

            <p>
                FinanceCalc ("we," "our," or "us") operates the financecalc.com website (the "Service").
                This Privacy Policy informs you of our policies regarding the collection, use, and disclosure
                of personal information when you use our Service.
            </p>

            <h2>1. Information We Collect</h2>
            <p><strong>Information You Provide:</strong> When you use our calculators, the financial data you input
                (such as loan amounts, savings figures, interest rates) is processed entirely in your browser.
                We do not collect, store, or transmit any financial data you enter into our calculators.</p>

            <p><strong>Automatically Collected Information:</strong> When you visit our website, we may automatically
                collect certain information, including:</p>
            <ul>
                <li>Your IP address and general geographic location</li>
                <li>Browser type and version</li>
                <li>Operating system</li>
                <li>Referring website</li>
                <li>Pages visited and time spent on each page</li>
                <li>Date and time of your visit</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use the collected information for the following purposes:</p>
            <ul>
                <li>To provide and maintain our Service</li>
                <li>To analyze usage patterns and improve our website</li>
                <li>To monitor for technical issues and security threats</li>
                <li>To comply with legal obligations</li>
            </ul>

            <h2>3. Cookies and Tracking Technologies</h2>
            <p>We use cookies and similar tracking technologies to track activity on our Service and hold
                certain information. Cookies are small data files placed on your device. You can instruct your
                browser to refuse all cookies or to indicate when a cookie is being sent.</p>

            <p><strong>Types of Cookies We Use:</strong></p>
            <ul>
                <li><strong>Essential Cookies:</strong> Necessary for the website to function properly.</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website (e.g., Google Analytics).</li>
                <li><strong>Advertising Cookies:</strong> Used by our advertising partners (e.g., Google AdSense) to serve relevant advertisements.</li>
            </ul>

            <h2>4. Third-Party Services</h2>
            <p>We may employ third-party companies and individuals for the following purposes:</p>
            <ul>
                <li><strong>Google Analytics:</strong> To monitor and analyze the use of our Service. Google Analytics collects data about website traffic. You can opt out by installing the Google Analytics opt-out browser add-on.</li>
                <li><strong>Google AdSense:</strong> To display advertisements on our website. Google AdSense uses cookies to serve ads based on your prior visits to our website or other websites. You can opt out of personalized advertising by visiting Google's Ads Settings.</li>
            </ul>

            <h2>5. Data Security</h2>
            <p>The security of your data is important to us. We implement appropriate technical and
                organizational measures to protect your personal information. However, no method of transmission
                over the Internet or method of electronic storage is 100% secure.</p>

            <h2>6. Children's Privacy</h2>
            <p>Our Service does not address anyone under the age of 13. We do not knowingly collect
                personally identifiable information from anyone under the age of 13. If you are a parent or
                guardian and you are aware that your child has provided us with personal data, please contact us.</p>

            <h2>7. Links to Other Sites</h2>
            <p>Our Service may contain links to other sites that are not operated by us. If you click on a
                third-party link, you will be directed to that third party's site. We strongly advise you to
                review the Privacy Policy of every site you visit.</p>

            <h2>8. Changes to This Privacy Policy</h2>
            <p>We may update our Privacy Policy from time to time. We will notify you of any changes by
                posting the new Privacy Policy on this page and updating the "Last Updated" date. Changes are
                effective immediately upon posting.</p>

            <h2>9. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the following rights regarding your personal data:</p>
            <ul>
                <li>The right to access, update, or delete your information</li>
                <li>The right to rectification</li>
                <li>The right to object to processing</li>
                <li>The right to data portability</li>
                <li>The right to withdraw consent</li>
            </ul>

            <h2>10. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at:</p>
            <p><strong>Email:</strong> privacy@financecalc.com</p>
            <p><strong>Website:</strong> <Link to="/">financecalc.com</Link></p>
        </div>
    );
}
