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
                    <div className="footer-col">
                        <h4>Calculators</h4>
                        <Link to="/compound-interest-calculator">Compound Interest</Link>
                        <Link to="/loan-payoff-calculator">Loan Payoff</Link>
                        <Link to="/retirement-calculator">Retirement</Link>
                        <Link to="/inflation-calculator">Inflation</Link>
                        <Link to="/debt-snowball-calculator">Debt Snowball</Link>
                    </div>
                    <div className="footer-col">
                        <h4>Learn</h4>
                        <Link to="/compound-interest-calculator">Investing Basics</Link>
                        <Link to="/debt-snowball-calculator">Debt Payoff Strategies</Link>
                        <Link to="/retirement-calculator">Retirement Planning</Link>
                        <Link to="/inflation-calculator">Understanding Inflation</Link>
                    </div>
                    <div className="footer-col">
                        <h4>Legal</h4>
                        <Link to="/privacy-policy">Privacy Policy</Link>
                        <Link to="/terms-and-conditions">Terms of Service</Link>
                        <Link to="/disclaimer">Disclaimer</Link>
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
