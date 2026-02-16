import { Link } from 'react-router-dom';

export default function Footer() {
    const year = new Date().getFullYear();
    return (
        <footer className="site-footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <div className="footer-logo">FinanceCalc</div>
                        <p>Free professional-grade financial calculators for compound interest, loan payoff, retirement planning, inflation analysis, and debt repayment.</p>
                    </div>
                    <div className="footer-col" id="footer-calculators">
                        <h4>Interactive Tools</h4>
                        <Link to="/compound-interest-calculator">Compound Interest</Link>
                        <Link to="/loan-payoff-calculator">Loan Payoff</Link>
                        <Link to="/retirement-calculator">Retirement Plan</Link>
                        <Link to="/inflation-calculator">Inflation Impact</Link>
                        <Link to="/debt-snowball-calculator">Debt Snowball</Link>
                    </div>
                    <div className="footer-col" id="footer-resources">
                        <h4>Learning Center</h4>
                        <Link to="/compound-interest-calculator#seo">Wealth Building 101</Link>
                        <Link to="/loan-payoff-calculator#seo">Debt Mastery Guide</Link>
                        <Link to="/retirement-calculator#seo">Retirement Strategy</Link>
                        <Link to="/inflation-calculator#seo">Economics of Inflation</Link>
                        <Link to="/debt-snowball-calculator#seo">Payoff Methodologies</Link>
                    </div>
                    <div className="footer-col" id="footer-legal">
                        <h4>Legal & Trust</h4>
                        <Link to="/privacy-policy">Privacy Policy</Link>
                        <Link to="/terms-and-conditions">Terms of Service</Link>
                        <Link to="/disclaimer">Earnings Disclaimer</Link>
                    </div>
                </div>
                <div className="footer-disclaimer">
                    <strong>Disclaimer:</strong> FinanceCalc provides calculators for educational and informational purposes only. Results are estimates based on the information you provide and are not financial advice. Always consult with qualified financial professionals before making important financial decisions.
                </div>
                <div className="footer-bottom">
                    <span>© {year} FinanceCalc. All rights reserved.</span>
                    <span>Built with precision for your financial future.</span>
                </div>
            </div>
        </footer>
    );
}
