import { useState } from 'react';

export default function ValidatedInput({
    id, name, label, hint, value, onChange, onBlur,
    error, touched, type = 'number',
    min, max, step, required = true, icon, prefix, suffix,
    className = '', disabled = false,
}) {
    const [focused, setFocused] = useState(false);
    const hasError = touched && error;
    const isValid = touched && !error && value !== '' && value !== undefined;

    const handleFocus = () => setFocused(true);
    const handleBlur = (e) => {
        setFocused(false);
        onBlur?.(e);
    };

    // Prevent non-numeric keyboard input for number fields
    const handleKeyDown = (e) => {
        if (type !== 'number') return;
        const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Enter', '.'];
        if (allowed.includes(e.key)) return;
        if (e.ctrlKey || e.metaKey) return;
        if (!/[0-9]/.test(e.key)) {
            e.preventDefault();
        }
    };

    // Prevent pasting non-numeric content
    const handlePaste = (e) => {
        if (type !== 'number') return;
        const paste = e.clipboardData.getData('text');
        if (!/^[\d.\-]+$/.test(paste)) {
            e.preventDefault();
        }
    };

    return (
        <div className={`vi-group ${hasError ? 'vi-error' : ''} ${isValid ? 'vi-valid' : ''} ${focused ? 'vi-focused' : ''} ${className}`}>
            <label htmlFor={id || name} className="vi-label">
                {icon && <span className="vi-label-icon">{icon}</span>}
                {label}
                {hint && <span className="vi-hint">{hint}</span>}
            </label>
            <div className="vi-input-wrap">
                {prefix && <span className="vi-prefix">{prefix}</span>}
                <input
                    id={id || name}
                    name={name}
                    type="text"
                    inputMode={type === 'number' ? 'decimal' : 'text'}
                    className={`vi-input${prefix ? ' has-prefix' : ''}${suffix ? ' has-suffix' : ''}`}
                    value={value}
                    onChange={onChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    min={min}
                    max={max}
                    step={step}
                    required={required}
                    disabled={disabled}
                    autoComplete="off"
                />
                {suffix && <span className="vi-suffix">{suffix}</span>}
                <div className="vi-state-icon">
                    {hasError && <span className="vi-icon-error">!</span>}
                    {isValid && <span className="vi-icon-valid">✓</span>}
                </div>
            </div>
            {hasError && <p className="vi-error-msg">{error}</p>}
        </div>
    );
}
