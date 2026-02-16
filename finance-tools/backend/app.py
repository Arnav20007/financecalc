"""
FinanceCalc — Flask Backend API
Production-ready REST API structure for financial calculations
"""

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'postgresql://localhost:5432/financecalc')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 📁 Frontend build folder
FRONTEND_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'dist')


# ─── Health Check ───────────────────────────────────────────────────────
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'version': '1.0.0',
        'service': 'FinanceCalc API'
    })


# ─── Compound Interest ─────────────────────────────────────────────────
@app.route('/api/calculate/compound-interest', methods=['POST'])
def compound_interest():
    data = request.json
    try:
        principal = float(data.get('principal', 0))
        monthly = float(data.get('monthly', 0))
        rate = float(data.get('rate', 0))
        years = int(data.get('years', 0))

        monthly_rate = rate / 100 / 12
        breakdown = []
        balance = principal
        total_contributions = principal
        total_interest = 0

        for year in range(1, years + 1):
            yearly_interest = 0
            for month in range(1, 13):
                interest = balance * monthly_rate
                yearly_interest += interest
                balance += interest + monthly
            total_contributions += monthly * 12
            total_interest += yearly_interest
            breakdown.append({
                'year': year,
                'balance': round(balance, 2),
                'totalContributions': round(total_contributions, 2),
                'yearlyInterest': round(yearly_interest, 2),
                'totalInterest': round(total_interest, 2),
            })

        return jsonify({
            'success': True,
            'data': {
                'finalBalance': round(balance, 2),
                'totalContributions': round(total_contributions, 2),
                'totalInterest': round(total_interest, 2),
                'breakdown': breakdown,
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400


# ─── Loan Payoff ───────────────────────────────────────────────────────
@app.route('/api/calculate/loan-payoff', methods=['POST'])
def loan_payoff():
    data = request.json
    try:
        amount = float(data.get('amount', 0))
        rate = float(data.get('rate', 0))
        payment = float(data.get('payment', 0))

        monthly_rate = rate / 100 / 12
        min_payment = amount * monthly_rate

        if payment <= min_payment:
            return jsonify({
                'success': False,
                'error': f'Monthly payment must be greater than ${min_payment:.2f}'
            }), 400

        schedule = []
        balance = amount
        total_interest = 0
        month = 0

        while balance > 0.01 and month < 600:
            month += 1
            interest = balance * monthly_rate
            principal_paid = min(payment - interest, balance)
            pmt = min(payment, balance + interest)
            balance -= principal_paid
            total_interest += interest
            balance = max(0, balance)
            schedule.append({
                'month': month,
                'payment': round(pmt, 2),
                'principal': round(principal_paid, 2),
                'interest': round(interest, 2),
                'balance': round(balance, 2),
            })

        return jsonify({
            'success': True,
            'data': {
                'totalMonths': month,
                'totalInterest': round(total_interest, 2),
                'totalPayments': round(total_interest + amount, 2),
                'schedule': schedule,
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400


# ─── Retirement Calculator ────────────────────────────────────────────
@app.route('/api/calculate/retirement', methods=['POST'])
def retirement():
    data = request.json
    try:
        current_age = int(data.get('currentAge', 0))
        retirement_age = int(data.get('retirementAge', 0))
        current_savings = float(data.get('currentSavings', 0))
        monthly_contribution = float(data.get('monthlyContribution', 0))
        expected_return = float(data.get('expectedReturn', 0))
        withdrawal_rate = float(data.get('withdrawalRate', 4))

        years = retirement_age - current_age
        if years <= 0:
            return jsonify({'success': False, 'error': 'Retirement age must be greater than current age'}), 400

        monthly_rate = expected_return / 100 / 12
        projection = []
        balance = current_savings
        total_contributions = current_savings

        for year in range(1, years + 1):
            yearly_growth = 0
            for month in range(1, 13):
                interest = balance * monthly_rate
                yearly_growth += interest
                balance += interest + monthly_contribution
            total_contributions += monthly_contribution * 12
            projection.append({
                'age': current_age + year,
                'year': year,
                'balance': round(balance, 2),
                'totalContributions': round(total_contributions, 2),
                'yearlyGrowth': round(yearly_growth, 2),
            })

        annual_withdrawal = round(balance * (withdrawal_rate / 100), 2)

        return jsonify({
            'success': True,
            'data': {
                'retirementCorpus': round(balance, 2),
                'totalContributions': round(total_contributions, 2),
                'totalGrowth': round(balance - total_contributions, 2),
                'annualWithdrawal': annual_withdrawal,
                'monthlyWithdrawal': round(annual_withdrawal / 12, 2),
                'projection': projection,
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400


# ─── Inflation Calculator ─────────────────────────────────────────────
@app.route('/api/calculate/inflation', methods=['POST'])
def inflation():
    data = request.json
    try:
        current_value = float(data.get('currentValue', 0))
        years = int(data.get('years', 0))
        inflation_rate = float(data.get('inflationRate', 0))

        rate = inflation_rate / 100
        breakdown = []

        for year in range(1, years + 1):
            future_value = current_value * ((1 + rate) ** year)
            purchasing_power = current_value / ((1 + rate) ** year)
            breakdown.append({
                'year': year,
                'futureValue': round(future_value, 2),
                'purchasingPower': round(purchasing_power, 2),
                'valueEroded': round(current_value - purchasing_power, 2),
                'cumulativeInflation': round(((1 + rate) ** year - 1) * 100, 2),
            })

        final_future = current_value * ((1 + rate) ** years)
        final_pp = current_value / ((1 + rate) ** years)

        return jsonify({
            'success': True,
            'data': {
                'currentValue': current_value,
                'futureEquivalent': round(final_future, 2),
                'futurePurchasingPower': round(final_pp, 2),
                'totalInflation': round(((1 + rate) ** years - 1) * 100, 2),
                'breakdown': breakdown,
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400


# ─── Serve React Frontend ─────────────────────────────────────────────
@app.route("/")
def serve_frontend():
    return send_from_directory(FRONTEND_FOLDER, "index.html")

@app.route("/<path:path>")
def serve_static(path):
    return send_from_directory(FRONTEND_FOLDER, path)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
