import { useCurrency } from '../../context/CurrencyContext';

export default function CurrencySelector() {
    const { currencyCode, setCurrencyCode, currencies } = useCurrency();

    return (
        <div className="currency-selector">
            <select
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value)}
                aria-label="Select currency"
                className="currency-select"
            >
                {currencies.map(c => (
                    <option key={c.code} value={c.code}>
                        {c.symbol} {c.code}
                    </option>
                ))}
            </select>
        </div>
    );
}
