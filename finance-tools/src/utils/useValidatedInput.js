import { useState, useCallback } from 'react';

/**
 * Sanitize and validate numeric input — prevents letters, special chars, NaN errors
 */
export function sanitizeNumericInput(value, { min, max, allowDecimal = true, allowNegative = false } = {}) {
    if (value === '' || value === undefined || value === null) return '';
    let str = String(value);
    // Remove everything except digits, decimal point, and optionally minus
    let pattern = allowNegative ? /[^0-9.-]/g : /[^0-9.]/g;
    str = str.replace(pattern, '');
    // Only allow one decimal point
    if (allowDecimal) {
        const parts = str.split('.');
        if (parts.length > 2) str = parts[0] + '.' + parts.slice(1).join('');
    } else {
        str = str.replace(/\./g, '');
    }
    // Only allow one minus at the start
    if (allowNegative && str.indexOf('-') > 0) {
        str = str.replace(/-/g, '');
    }
    return str;
}

export function validateNumericValue(value, { min, max, required = true, fieldName = 'Value' } = {}) {
    if (value === '' || value === undefined || value === null) {
        return required ? `${fieldName} is required` : null;
    }
    const num = parseFloat(value);
    if (isNaN(num)) return `${fieldName} must be a valid number`;
    if (min !== undefined && num < min) return `${fieldName} must be at least ${min}`;
    if (max !== undefined && num > max) return `${fieldName} must be at most ${max}`;
    return null;
}

/**
 * Hook for validated numeric inputs across all calculator forms
 */
export function useValidatedInputs(initialValues, validationRules = {}) {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        const rule = validationRules[name] || {};
        const sanitized = rule.type === 'text' ? value : sanitizeNumericInput(value, rule);
        setValues(prev => ({ ...prev, [name]: sanitized }));
        // Clear error on change
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    }, [validationRules, errors]);

    const handleBlur = useCallback((e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        const rule = validationRules[name] || {};
        const error = rule.type === 'text' ? null : validateNumericValue(values[name], { ...rule, fieldName: rule.label || name });
        setErrors(prev => ({ ...prev, [name]: error }));
    }, [validationRules, values]);

    const validateAll = useCallback(() => {
        const newErrors = {};
        let isValid = true;
        for (const [name, rule] of Object.entries(validationRules)) {
            if (rule.type === 'text') continue;
            const error = validateNumericValue(values[name], { ...rule, fieldName: rule.label || name });
            if (error) {
                newErrors[name] = error;
                isValid = false;
            }
        }
        setErrors(newErrors);
        setTouched(Object.keys(validationRules).reduce((acc, k) => ({ ...acc, [k]: true }), {}));
        return isValid;
    }, [validationRules, values]);

    const getNumericValue = useCallback((name) => {
        const v = parseFloat(values[name]);
        return isNaN(v) ? 0 : v;
    }, [values]);

    const resetForm = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
    }, [initialValues]);

    return {
        values, errors, touched, handleChange, handleBlur, validateAll,
        getNumericValue, setValues, setErrors, resetForm,
    };
}
