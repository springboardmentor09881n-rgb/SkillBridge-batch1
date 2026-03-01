import React from 'react';
import './Input.css'; // Reusing input styles

const Select = ({
    label,
    error,
    id,
    options = [],
    className = '',
    ...props
}) => {
    return (
        <div className={`input-group ${className}`}>
            {label && <label htmlFor={id} className="input-label">{label}</label>}
            <select
                id={id}
                className={`input-field ${error ? 'input-error' : ''}`}
                {...props}
            >
                <option value="" disabled>Select an option</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && <span className="input-error-msg">{error}</span>}
        </div>
    );
};

export default Select;
