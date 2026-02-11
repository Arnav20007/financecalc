import { Link } from 'react-router-dom';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="site-footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <div className="footer-logo">FinanceCalc</div>
                        <p>
                            Free, professional-grade financial calculators to help you make smarter money decisions.
                            Plan your investments, manage debt, and build a secure financial future.
                        </p>
                    </div>
                    <div className="footer-col">
                        <h4>Calculators</h4>
                        <Link to="/compound-interest-calculator">Compound Interest</Link>
                        <Link to="/loan-payoff-calculator">Loan Payoff</Link>
                        <Link to="/retirement-calculator">Retirement</Link>
                        <Link to="/inflation-calculator">Inflation</Link>
                        <Link to="/debt-snowball-calculator">Debt Snowball</Link>
                    </div>
                    <div className="footer-col">
                        <h4>Resources</h4>
                        <a href="#guides">Financial Guides</a>
                        <a href="#blog">Blog</a>
                        <a href="#newsletter">Newsletter</a>
                        <a href="#support">Support</a>
                    </div>
                    <div className="footer-col">
                        <h4>Legal</h4>
                        <Link to="/privacy-policy">Privacy Policy</Link>
                        <Link to="/terms-and-conditions">Terms & Conditions</Link>
                        <Link to="/disclaimer">Disclaimer</Link>
                    </div>
                </div>
                <div className="footer-disclaimer">
                    <strong>Disclaimer:</strong> The calculations provided by FinanceCalc are for informational and educational purposes only.
                    They do not constitute financial, investment, tax, or legal advice. Results are estimates and may not reflect actual
                    outcomes. Always consult a qualified financial professional before making financial decisions.
                </div>
                <div className="footer-bottom">
                    <span>© {currentYear} FinanceCalc. All rights reserved.</span>
                    <span>Built with precision for financial clarity.</span>
                </div>
            </div>
        </footer>
    );
}
